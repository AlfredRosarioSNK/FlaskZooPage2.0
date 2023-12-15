var calendarEl = document.getElementById("calendar");
var calendar = new FullCalendar.Calendar(calendarEl, {

    eventClick: function (info) {

    },
    eventContent: function (info) {
        var eventDate = info.event.start;
        var eventName = info.event.title;

        return {
            html: '<div class="event-content"><span class="event-title">' + eventName + '</span><br>' + eventDate.toLocaleDateString() + '</div>'
        };
    },
});
calendar.render();
function loadTickets() {
    fetch('/api/getDates')
        .then(response => response.json())
        .then(data => {
            var ticketsContainer = document.getElementById("tickets-container");
            ticketsContainer.innerHTML = "";
            if (data.length > 0) {
                document.getElementById("tickets-heading").style.display = "block";
                data.forEach(function (ticket) {
                    var ticketElement = document.createElement("div");
                    ticketElement.className = "ticket";
                    ticketElement.innerHTML = `
                  <div class="ticket">
                      <div class="stub">
                          <div class="top">
                              <span class="admit">Alfred's Zoo</span>
                              <span class="line"></span>
                              <span class="num">${ticket.title}</span>
                          </div>
                          <div class="number">🦁</div>
                          <div class="invite">${ticket.extendedProps.guidedTour}</div>
                      </div>
                      <div class="check">
                          <div class="big">Zoo Entry</div>
                          <div class="numberOfVisitors">Visitors: ${ticket.extendedProps.visitors}</div>
                          <div class="info">
                              <section>
                                  <div class="title">Date</div>
                                  <div>${ticket.start}</div>
                              </section>
                              <section>
                                  <div class="title">Ticket ID: ${ticket.id}</div>
                                  <button onclick="cancelReservation('${ticket.id}')" class="cancel-button">Cancel</button>
                                  <button onclick="attemptChangeDate('${ticket.id}', '${ticket.start}')" class="change-date-button">Change date</button>
                              </section>
                          </div>
                      </div>
                  </div>
              `;
                    ticketsContainer.appendChild(ticketElement);
                });
            }
        })
        .catch(error => console.error('Error loading tickets:', error));
}
loadTickets();

function attemptChangeDate(ticketId, currentStartDate) {
    document.getElementById("change-date-form-container").style.display = "block";

    document.getElementById("submit-new-date").onclick = function () {
        var newDate = document.getElementById("new-date-entry").value;
        if (newDate) {
            fetch('/api/changeDate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticketId: ticketId, newDate: newDate })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        alert('Date changed successfully.');
                        loadTickets();
                        reloadCalendarEvents();
                        document.getElementById("change-date-form-container").style.display = "none";
                    } else {
                        alert(data.message);
                    }
                })
                .catch(error => console.error('Error:', error));
        } else {
            alert("Please, select a new date.");
        }
    };

    document.getElementById("cancel-change-date").onclick = function () {
        document.getElementById("change-date-form-container").style.display = "none";
    };
}
function reloadCalendarEvents() {
    calendar.removeAllEvents();
    fetch('/api/getDates')
        .then(response => response.json())
        .then(events => {
            events.forEach(event => {
                calendar.addEvent(event);
            });
        })
        .catch(error => console.error('Error loading events:', error));
}


document.getElementById("schedule-entry").addEventListener("click", function () {
    var dateEntry = document.getElementById("date-entry").value;
    var nameEntry = document.getElementById("name-entry").value;
    var lastNameEntry = document.getElementById("last-name-entry").value;
    var numberOfVisitors = document.getElementById("visitorsCuantity").value;
    var guidedTourConfirmationValue = document.getElementById("guidedTourConfirmation").checked ? 'Tour Included!' : 'Have fun!';

    if (dateEntry) {
        var formData = new FormData();
        formData.append("date", dateEntry);
        formData.append("name-entry", nameEntry);
        formData.append("last-name-entry", lastNameEntry);
        formData.append("visitorsCuantity", numberOfVisitors);
        formData.append("guidedTourConfirmation", guidedTourConfirmationValue);

        fetch('/api/addDate', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    sessionStorage.setItem('reservationId', data.reservationId);
                    sessionStorage.setItem('reservationInfo', JSON.stringify({
                        date: dateEntry,
                        name: nameEntry,
                        lastName: lastNameEntry,
                        visitors: numberOfVisitors,
                        guidedTour: guidedTourConfirmationValue
                    }));
                    document.getElementById("confirmation-form-container").style.display = "block";
                    document.getElementById("reservation-details").innerHTML = `
              <p>Date: ${dateEntry}</p>
              <p>Name: ${nameEntry} ${lastNameEntry}</p>
              <p>Number of visitors: ${numberOfVisitors}</p>
              <p>Guided tour: ${guidedTourConfirmationValue}</p>
              <p>Total: 1000$</p>
          `;
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        alert("Please select a date to schedule a visit.");
    }
});

function loadEventsToCalendar() {
    fetch('/api/getDates')
        .then(response => response.json())
        .then(data => {

            data.forEach(function (eventData) {
                calendar.addEvent({
                    title: eventData.title,
                    start: eventData.start,
                });
            });
        })
        .catch(error => {
            console.error('Error loading events:', error);
        });
}
document.addEventListener('DOMContentLoaded', function () {
    loadEventsToCalendar();
    confirmPaymentAfterRedirect();

});
document.getElementById("proceed-to-payment").addEventListener("click", function () {
    var reservationId = sessionStorage.getItem('reservationId');
    if (reservationId) {
        window.location.href = `/paymentProcessing?reservationId=${reservationId}`;
    } else {
        alert("There is no reservation pending payment.");
    }
});

function cancelReservation(eventId) {
    fetch('/api/cancelDate', {
        method: 'POST',
        body: JSON.stringify({ event_id: eventId }),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
                location.reload();
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error('Error:', error));
}
function confirmPaymentAfterRedirect() {
    var reservationId = sessionStorage.getItem('reservationId');
    if (reservationId) {
        fetch('/api/confirmPayment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reservationId: reservationId })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Reservation successfully confirmed.');
                    sessionStorage.removeItem('reservationId');
                } else {
                    alert(data.message);
                }
            })
            .catch(error => console.error('Error:', error));
    }
}
document.addEventListener('DOMContentLoaded', function () {
    var today = new Date();
    var maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);
    var minDateStr = today.toISOString().split('T')[0];
    var maxDateStr = maxDate.toISOString().split('T')[0];
    document.getElementById("date-entry").setAttribute('min', minDateStr);
    document.getElementById("date-entry").setAttribute('max', maxDateStr);
});
window.addEventListener('resize', function () {
    calendar.updateSize();
});