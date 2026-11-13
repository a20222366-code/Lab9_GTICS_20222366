package org.example.lab9_gtics_20222366.entity;
import jakarta.persistence.*;


@Entity
@Table(name = "stf_puzzle_sv")
public class PuzzleSv {

    @Id
    private Integer id;

    @Column(name = "stf_game_board_structure")
    private String stfGameBoardStructure;

    @Column(name = "image")
    private String image;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getStfGameBoardStructure() {
        return stfGameBoardStructure;
    }

    public void setStfGameBoardStructure(String stfGameBoardStructure) {
        this.stfGameBoardStructure = stfGameBoardStructure;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
