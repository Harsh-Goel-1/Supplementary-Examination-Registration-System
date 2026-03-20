-- Supplementary Examination Registration System
-- Students sign up / sign in with @nith.ac.in college email,
-- select a course (subject) to apply for supplementary exam,
-- pay ₹500 on SBI Collect, and enter the transaction ID.

-- 1) COURSE (the courses / subjects offered for supplementary exams)
CREATE TABLE course (
    course_id    INT AUTO_INCREMENT PRIMARY KEY,
    course_code  VARCHAR(20)  NOT NULL UNIQUE,
    course_name  VARCHAR(150) NOT NULL
);

-- 2) STUDENT (authenticated via @nith.ac.in college email)
CREATE TABLE student (
    student_id  INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    roll_no     VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,              -- hashed password
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    -- ensure only NIT Hamirpur college emails are accepted
    CONSTRAINT chk_college_email CHECK (email LIKE '%@nith.ac.in')
);

-- 3) REGISTRATION (one row per supplementary-exam application)
CREATE TABLE registration (
    reg_id      INT AUTO_INCREMENT PRIMARY KEY,
    student_id  INT NOT NULL,
    course_id   INT NOT NULL,
    status      ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    applied_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES student(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (course_id) REFERENCES course(course_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- 4) PAYMENT (₹500 SBI Collect payment linked to a registration)
CREATE TABLE payment (
    payment_id      INT AUTO_INCREMENT PRIMARY KEY,
    reg_id          INT            NOT NULL UNIQUE,
    transaction_id  VARCHAR(100)   NOT NULL UNIQUE,   -- SBI Collect transaction ID
    amount          DECIMAL(10,2)  NOT NULL DEFAULT 500.00,
    paid_at         TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (reg_id) REFERENCES registration(reg_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
