CREATE TABLE LevelQueueItem (
    Id INT NOT NULL AUTO_INCREMENT,
    LevelQueueId INT NOT NULL,
    LevelStateId INT NOT NULL,
    LevelCode VARCHAR(12) NOT NULL,
    Username NVARCHAR(50) NOT NULL,
    IsMod BIT NOT NULL,
    IsVip BIT NOT NULL,
    IsSub BIT NOT NULL,
    CreatedAt DATETIME NOT NULL,
    PRIMARY KEY (Id)
);