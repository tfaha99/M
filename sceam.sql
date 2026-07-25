CREATE DATABASE IF NOT EXISTS `portofolio-database`;
USE `portofolio-database`;

CREATE TABLE IF NOT EXISTS ContactSubmissions (
    Id          INT             AUTO_INCREMENT PRIMARY KEY,
    FullName    VARCHAR(100)    NOT NULL,
    Email       VARCHAR(100)    NOT NULL,
    Phone       VARCHAR(50)     NOT NULL,
    Message     TEXT            NOT NULL,
    SubmittedAt DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
);