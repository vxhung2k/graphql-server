const sql = `
CREATE TABLE User(
    id VARCHAR(36) NOT NULL UNIQUE,
    PRIMARY KEY (id),
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(300) NOT NULL,
    phoneNumber VARCHAR(10) NOT NULL,
    gender ENUM('male','female','orther') NOT NULL DEFAULT 'male',
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    province VARCHAR(6) NOT NULL,
    district VARCHAR(6) NOT NULL,
    ward VARCHAR(6) NOT NULL,
    street VARCHAR(50) NOT NULL,
    houseNumber VARCHAR(60) NOT NULL,
    avatar VARCHAR(200),
    dateOfBirth DATE,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Otp(
    id Int NOT NULL AUTO_INCREMENT,
    PRIMARY KEY(id),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    otp VARCHAR(6) ,
    FOREIGN KEY (user_id) REFERENCES User(id)

);
CREATE TABLE Product(
    id VARCHAR(36) NOT NULL UNIQUE,
    PRIMARY KEY (id),
    name VARCHAR(200) NOT NULL,
    title VARCHAR(300),
    description VARCHAR(1000),
    price BIGINT(20),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Comment(
    id Int NOT NULL AUTO_INCREMENT,
    PRIMARY KEY(id),
    comment VARCHAR(1000),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    product_id VARCHAR(36) NOT NULL UNIQUE,
    parent_id Int,
    has_next_reply BOOLEAN DEFAULT false,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (product_id) REFERENCES Product(id) ON DELETE CASCADE
);
CREATE TABLE Likes (
    id INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY(id),
    is_liked BOOLEAN DEFAULT true,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    product_id VARCHAR(36) NOT NULL UNIQUE,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (product_id) REFERENCES Product(id) ON DELETE CASCADE
);

`;
export default sql;