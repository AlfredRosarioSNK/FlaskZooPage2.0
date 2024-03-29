let CREATE_PAYMENT_URL = 'http://localhost:5000/payment';
let EXECUTE_PAYMENT_URL = 'http://localhost:5000/execute';
paypal.Button.render({
    env: 'sandbox',
    commit: true,
    payment: function () {
        return paypal.request.post(CREATE_PAYMENT_URL).then(function (data) {
            return data.paymentID;
        });
    },
    onAuthorize: function (data) {
        return paypal.request.post(EXECUTE_PAYMENT_URL, {
            paymentID: data.paymentID,
            payerID: data.payerID
        }).then(function (res) {
            if (res.success) {
                let reservationId = new URLSearchParams(window.location.search).get('reservationId');
                if (!reservationId) {
                    reservationId = sessionStorage.getItem('reservationId');
                }
                window.location.href = '/scheduleEntry?reservationId=' + reservationId;
            } else {
                console.error('Processing payment error.');
            }
        });
    }
}, '#paypal-button');