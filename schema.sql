-- 1) COURSE
CREATE TABLE course (
    course_id   INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL
);

-- 2) STUDENT
CREATE TABLE student (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    roll_no    VARCHAR(50) UNIQUE NOT NULL
);

-- 3) SUBJECT
CREATE TABLE subject (
    subject_id   INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    course_id    INT NOT NULL,

    FOREIGN KEY (course_id) REFERENCES course(course_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- 4) REGISTRATION
CREATE TABLE registration (
    reg_id     INT AUTO_INCREMENT PRIMARY KEY,
    status     VARCHAR(30) NOT NULL,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,

    FOREIGN KEY (student_id) REFERENCES student(student_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (subject_id) REFERENCES subject(subject_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- 5) PAYMENT
CREATE TABLE payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    amount     DECIMAL(10,2) NOT NULL,
    reg_id     INT NOT NULL UNIQUE,

    FOREIGN KEY (reg_id) REFERENCES registration(reg_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

