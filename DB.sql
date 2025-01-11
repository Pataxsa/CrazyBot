-- Guild informations
CREATE TABLE IF NOT EXISTS guilds (
    id VARCHAR(19) PRIMARY KEY,
    temp_channels VARCHAR(19)[]
);

-- User informations
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(19) PRIMARY KEY,
    login varchar(40),
    reminders JSONB[]
);
