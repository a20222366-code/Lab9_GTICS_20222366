CREATE DATABASE IF NOT EXISTS stf_games_20222366
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE stf_games_20222366;


CREATE TABLE stf_puzzle_sv (
    id      INT PRIMARY KEY,
    stf_game_board_structure  VARCHAR(30),
    image LongText
    
) ENGINE=InnoDB;


INSERT INTO stf_puzzle_sv (id, stf_game_board_structure, image) VALUES
  ('1',  '1234567X', NULL);