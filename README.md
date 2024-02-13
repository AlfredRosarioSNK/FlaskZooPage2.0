# Welcome to my project, here is a little tutorial to teach you how to setup all

# First of all, these are the technologies used in this project.

- HTML
- CSS
- JavaScript
- Bootstrap
- Python
- Anaconda
- MongoDB
- Flask

**Before we begin, make sure you have the following tools installed:**

- [Git](https://git-scm.com/downloads)
- [Anaconda](https://www.anaconda.com/)
- A code editor (e.g., [Visual Studio Code](https://code.visualstudio.com/))

# Step 1: Installing Git
1. Download and install Git from [here](https://git-scm.com/downloads).
2. Follow the setup instructions provided on the Git website to configure it according to your preferences.

# Step 2: Installing Anaconda
1. Download and install Anaconda from [here](https://www.anaconda.com/).
2. Follow the installation instructions and set up Anaconda on your system as per the documentation.

# Step 3: Clone the Repository
1. Open your terminal or command prompt.
2. Navigate to the directory where you want to clone the repository.
3. Run the following command to clone the repository to your local machine:
   ```shell
   git clone https://github.com/AlfredRosarioSNK/ZooWebPage


# Step 4: Configure the Python Environment
 1. Once the repository is cloned, you'll find a file called environment.yml in the project directory. This file defines the project's Python environment and required libraries.

 2. Open Anaconda and navigate to the project directory using the terminal. You can do this by copying the path from the file explorer and using the cd command, like this:
    
    ```shell
    cd C:\Users\YourUsername\Path\To\ZooWebPage
 
 3. Now, create a new Anaconda environment using the provided environment.yml file to ensure you have the necessary dependencies:
    
    ```shell
    conda env create -f environment.yml

# Step 5: Run the Project

1. After successfully creating the environment, you can run the project. Make sure you are still in the project directory in your terminal.
2. Run the following command to start the project:
    
    ```shell
    python index.py

Now, your project should be up and running without any issues.

If you encounter any problems during setup or have questions, please refer to the documentation or reach out for help.

Feel free to tailor this tutorial to your specific needs and project details.

# Providing Access to the MongoDB Atlas Database

## Step 1: Configure Your .env File

1. Create a `.env` file in the root of your project and store your MongoDB Atlas connection string in it. Your `.env` file should look like this:

    ```shell
    MONGO_CLIENT=mongodb+srv://GuestUserZooPage:L3aW3xquOqie0SPJ@webzoocluster.eja6fb6.mongodb.net/

**Note**: The `MONGO_CLIENT` value (`mongodb+srv://GuestUserZooPage:L3aW3xquOqie0SPJ@webzoocluster.eja6fb6.mongodb.net/`) represents a user with read access to the database made it just for you!.

2. Add the `.env` file to your `.gitignore` to ensure it is not pushed to version control.

**Note**: ⚠️ Finally you need to make sure your .env file look some like this: SECRET_KEY=<`your secret key`>
MAIL_USERNAME=<`your email`>
MAIL_PASSWORD=<`your password`>
MONGO_CLIENT=mongodb+srv://GuestUserZooPage:L3aW3xquOqie0SPJ@webzoocluster.eja6fb6.mongodb.net/
GOOGLE_APPLICATION_CREDENTIALS=<`C:/your/aouth/google/key/archive.json`> (more info: https://developers.google.com/identity/protocols/oauth2)
PAYPAL_CLIENT_ID=<`your paypal client ID`>
PAYPAL_CLIENT_SECRET=<`your paypal secret key`>
 