package org.example.lab9_gtics_20222366.controller;


import org.example.lab9_gtics_20222366.entity.PuzzleSv;
import org.example.lab9_gtics_20222366.repository.PuzzleSvRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/puzzle")
public class PuzzleController {

    private final PuzzleSvRepository repo;

    public PuzzleController(PuzzleSvRepository repo) {
        this.repo = repo;
    }


    @GetMapping
    public ResponseEntity<HashMap<String, Object>> obtener (){

        HashMap<String, Object> respuesta= new HashMap <> ();
        Optional<PuzzleSv> opt = repo.findBy(1);

        if (opt.isPresent()){

            respuesta.put("estado", "ok");
            respuesta.put("puzzle", opt.get());

            return ResponseEntity.ok(respuesta);

        }

        respuesta.put("estado", "error");
        respuesta.put("msg", "No existe la fila");


        return ResponseEntity.badRequest().body(respuesta);

    }


    @PostMapping("/estructura")
    public ResponseEntity<HashMap<String, Object>> guardarEstructura (@RequestBody PuzzleSv body){

        HashMap<String, Object> respuesta= new HashMap <> ();
        Optional<PuzzleSv> opt = repo.findBy(1);


        if (opt.isPresent() && body.getStfGameBoardStructure() != null){

            PuzzleSv puzzle = opt.get();

            puzzle.setStfGameBoardStructure(body.getStfGameBoardStructure());

            repo.save(puzzle);
            
            respuesta.put("estado", "ok");
            respuesta.put("puzzle", opt.get());

            return ResponseEntity.ok(respuesta);

        }






    }










}








