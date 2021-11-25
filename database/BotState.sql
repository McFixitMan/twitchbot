CREATE TABLE BotState (
    Id INT NOT NULL AUTO_INCREMENT,
    ActiveQueueId INT NULL,
    ActiveQueueItemId INT NULL,
    LastCommand VARCHAR(15) NULL,
    StartedAt DATETIME NULL,
    PRIMARY KEY (Id)
);