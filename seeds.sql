USE directory_DB;

INSERT INTO department (name) VALUES ('Engineering');
INSERT INTO department (name) VALUES ('Sales');
INSERT INTO department (name) VALUES ('Finance');
INSERT INTO department (name) VALUES ('Legal');

INSERT INTO role (title, salary, department_id) VALUES ('Software Engineer', 100000, 1);
INSERT INTO role (title, salary, department_id) VALUES ('Sales Rep', 80000, 2);
INSERT INTO role (title, salary, department_id) VALUES ('Accountant', 50000, 3);
INSERT INTO role (title, salary, department_id) VALUES ('Lawyer', 95000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('Heather', 'Jackson', 1, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('Sam', 'Jones', 2, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('Liz', 'Smith', 3, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('Cory', 'Baker', 4, 3);

