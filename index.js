const mysql = require("mysql2");
const inquirer = require("inquirer");
const cTable = require("console.table");
const util = require("util");

require("dotenv").config();

// connection information
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// changes connection.query to promise-based
connection.query = util.promisify(connection.query);

// "Homepage" => list of actions
function runSearch() {
  inquirer
    .prompt([
      {
        name: "action",
        type: "list",
        message: "Choose one of the following actions:",
        choices: [
          "Add a department",
          "Add a role",
          "Add an employee",
          "View all departments",
          "View all roles",
          "View all employees",
          "Update an employee's role",
          "Exit",
        ],
      },
    ])
    .then((answer) => {
      console.log(answer.action);
      switch (answer.action) {
        case "Add a department":
          addDepartment();
          break;
        case "Add a role":
          addRole();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "View all departments":
          viewAllDepartments();
          break;
        case "View all roles":
          viewAllRoles();
          break;
        case "View all employees":
          viewAllEmployees();
          break;
        case "Update an employee's role":
          updateEmployeeRole();
          break;
        default:
          connection.end();
      }
    });
}

function addDepartment() {
  inquirer
    .prompt({
      name: "department",
      type: "input",
      message: "What is the name of the new department?",
    })
    .then((answer) => {
      connection.query(
        "INSERT INTO department SET ?",
        {
          name: answer.department,
        },
        (err) => {
          if (err) throw err;
          console.log(`You have successfully added a department.\n`);
          runSearch();
        }
      );
    });
}

function addRole() {
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    const departmentArray = [
      {
        name: "Engineering",
        value: 1,
      },
      {
        name: "Sales",
        value: 2,
      },
      {
        name: "Finance",
        value: 3,
      },
      {
        name: "Legal",
        value: 4,
      },
    ];
    inquirer
      .prompt([
        {
          name: "title",
          type: "input",
          message: "What is the title of the new role?",
        },
        {
          name: "salary",
          type: "input",
          message: "How much is their salary?",
        },
        {
          name: "department",
          type: "list",
          message: "What department?",
          choices: departmentArray,
        },
      ])
      .then((answer) => {
        console.log(answer);
        connection.query(
          "INSERT INTO role SET ?",
          {
            title: answer.title,
            salary: answer.salary,
            department_id: answer.department,
          },
          (err) => {
            if (err) throw err;
            console.log(`You have successfully added a role.\n`);
            runSearch();
          }
        );
      });
  });
}

function addEmployee() {
  connection.query("SELECT * FROM role", function (err, res) {
    if (err) throw err;
    console.log("Add a new employee below:\n");
    const roleArray = [
      {
        name: "Software Engineer",
        value: 1,
      },
      {
        name: "Sales Rep",
        value: 2,
      },
      {
        name: "Accountant",
        value: 3,
      },
      {
        name: "Lawyer",
        value: 4,
      },
    ];
    inquirer
      .prompt([
        {
          type: "input",
          name: "first_name",
          message: "What is the Employee's first name?",
        },
        {
          type: "input",
          name: "last_name",
          message: "What is the Employee's last name?",
        },
        {
          type: "list",
          name: "role_id",
          message: "What is the Employee's role?",
          choices: roleArray,
        },
        {
          name: "manager_id",
          type: "input",
          message: "What is the employee's manager's id #?",
        },
      ])
      .then(function (answer) {
        console.log(answer);
        connection.query(
          "INSERT INTO employee SET ?",
          {
            first_name: answer.first_name,
            last_name: answer.last_name,
            role_id: answer.role_id,
            manager_id: answer.manager_id,
          },
          function (err) {
            if (err) throw err;
            console.log("You're employee was successfully added");
            runSearch();
          }
        );
      });
  });
}

function viewAllDepartments() {
  connection
    .query("SELECT * FROM department")
    .then((res) => {
      console.log(`\n`);
      console.table(res);
      console.log("-------------------------------------------------\n");
      runSearch();
    })
    .catch((err) => {
      console.log(err);
    });
}

function viewAllRoles() {
  connection.query(
    `SELECT role.id, name AS department, title, salary
    FROM department
    LEFT JOIN role ON department.id = role.department_id;`,
    function (err, res) {
      if (err) throw err;
      console.table(res);
      runSearch();
    }
  );
}

function viewAllEmployees() {
  console.log("Selecting all employees....\n");
  connection.query(
    `SELECT e.id, e.first_name, e.last_name, name AS department, title, salary, CONCAT(m.first_name,' ', m.last_name) AS manager
    FROM department
    LEFT JOIN role ON department.id = role.department_id
    LEFT JOIN employee e ON role.id = e.role_id
    LEFT JOIN employee m ON m.id = e.manager_id;`,
    function (err, res) {
      if (err) throw err;
      console.log(res.length + " employees found.");
      console.table(res);
      runSearch();
    }
  );
}

function updateEmployeeRole() {
  const employeeArray = [];
  const roleArray = [];
  connection.query(
    `SELECT CONCAT (employee.first_name, ' ', employee.last_name) as employee FROM directory_DB.employee`,
    (err, res) => {
      if (err) throw err;
      for (let i = 0; i < res.length; i++) {
        employeeArray.push(res[i].employee);
      }
      connection.query(`SELECT title FROM directory_DB.role`, (err, res) => {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
          roleArray.push(res[i].title);
        }

        inquirer
          .prompt([
            {
              name: "name",
              type: "list",
              message: `Choose the employee that needs a role update:`,
              choices: employeeArray,
            },
            {
              name: "role",
              type: "list",
              message: "What would you like to change their role to?",
              choices: roleArray,
            },
          ])
          .then((answers) => {
            let currentRole;
            const name = answers.name.split(" ");
            connection.query(
              `SELECT id FROM directory_DB.role WHERE title = '${answers.role}'`,
              (err, res) => {
                if (err) throw err;
                for (let i = 0; i < res.length; i++) {
                  currentRole = res[i].id;
                }
                connection.query(
                  `UPDATE directory_DB.employee SET role_id = ${currentRole} WHERE first_name= '${name[0]}' AND last_name= '${name[1]}';`,
                  (err, res) => {
                    if (err) throw err;
                    console.log(`You have successfully upated the role.`);
                    runSearch();
                  }
                );
              }
            );
          });
      });
    }
  );
}

// create connection to MySQL server and database
connection.connect(function (err) {
  if (err) throw err;
  console.log(
    "Welcome to your Employee Management System! Choose one of the following options to begin or hit Ctrl + C to exit at any time:" +
      "\n"
  );
  runSearch();
});
