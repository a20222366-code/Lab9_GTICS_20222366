CREATE DATABASE IF NOT EXISTS stf_games_20222366
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE stf_games_20222366;

DROP TABLE IF EXISTS stf_puzzle_sv;

CREATE TABLE stf_puzzle_sv (
    stf_game_board_structure VARCHAR(64) NULL,
    image                    LONGTEXT    NULL
) ENGINE=InnoDB;

INSERT INTO stf_puzzle_sv (stf_game_board_structure, image) VALUES (NULL, NULL);

USE stf_games_20222366;
SELECT * FROM stf_puzzle_sv;
