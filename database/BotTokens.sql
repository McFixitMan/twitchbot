CREATE TABLE BotTokens (
    Id INT NOT NULL AUTO_INCREMENT,
    TokenOwner VARCHAR(50) NOT NULL,
    AccessToken VARCHAR(255) NOT NULL,
    RefreshToken VARCHAR(255) NOT NULL,
    ExpiresIn INT NOT NULL,
    ObtainmentTimestamp BIGINT NOT NULL,
    PRIMARY KEY (Id)
)