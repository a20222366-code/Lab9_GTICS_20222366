package org.example.lab9_gtics_20222366.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/puzzle")
public class PuzzleController {

    private final JdbcTemplate jdbc;

    public PuzzleController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    public ResponseEntity<HashMap<String, Object>> obtener() {
        HashMap<String, Object> respuesta = new HashMap<>();
        List<Map<String, Object>> filas = jdbc.queryForList(
                "SELECT stf_game_board_structure, image FROM stf_puzzle_sv LIMIT 1");

        if (filas.isEmpty()) {
            respuesta.put("estado", "error");
            respuesta.put("msg", "No existe la fila");
            return ResponseEntity.badRequest().body(respuesta);
        }

        Map<String, Object> fila = filas.get(0);
        HashMap<String, Object> puzzle = new HashMap<>();
        puzzle.put("stfGameBoardStructure", fila.get("stf_game_board_structure"));
        puzzle.put("image", fila.get("image"));

        respuesta.put("estado", "ok");
        respuesta.put("puzzle", puzzle);
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/estructura")
    public ResponseEntity<HashMap<String, Object>> guardarEstructura(@RequestBody HashMap<String, String> body) {
        HashMap<String, Object> respuesta = new HashMap<>();
        String estructura = body.get("stfGameBoardStructure");

        if (estructura != null && estructura.matches("[0-9A-Za-z]{9,36}")
                && estructura.chars().filter(c -> c == 'X').count() == 1) {
            jdbc.update("UPDATE stf_puzzle_sv SET stf_game_board_structure = ?", estructura);
            respuesta.put("estado", "actualizado");
            return ResponseEntity.ok(respuesta);
        }

        respuesta.put("estado", "error");
        respuesta.put("msg", "Envie una estructura de tablero valida");
        return ResponseEntity.badRequest().body(respuesta);
    }

    @PutMapping("/imagen")
    public ResponseEntity<HashMap<String, Object>> guardarImagen(@RequestBody HashMap<String, String> body) {
        HashMap<String, Object> respuesta = new HashMap<>();
        String imagen = body.get("image");

        if (imagen != null && !imagen.isBlank()) {
            jdbc.update("UPDATE stf_puzzle_sv SET image = ?", imagen);
            respuesta.put("estado", "actualizado");
            return ResponseEntity.ok(respuesta);
        }

        respuesta.put("estado", "error");
        respuesta.put("msg", "Envie la imagen");
        return ResponseEntity.badRequest().body(respuesta);
    }

    @PutMapping("/reiniciar")
    public ResponseEntity<HashMap<String, Object>> reiniciar() {
        HashMap<String, Object> respuesta = new HashMap<>();
        jdbc.update("UPDATE stf_puzzle_sv SET stf_game_board_structure = NULL, image = NULL");
        respuesta.put("estado", "reiniciado");
        return ResponseEntity.ok(respuesta);
    }
}