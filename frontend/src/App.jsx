import { useRef, useState } from 'react'
// import './App.css'
import '@aws-amplify/ui-react/styles.css';
import { Button } from "@aws-amplify/ui-react";
import { SliderField } from '@aws-amplify/ui-react'; //No dejaba usar '@mui/material'.

function App() {
  let [location, setLocation] = useState(""); //URL de la simulación.
  let [trees, setTrees] = useState([]); //Lista de arbolitos.
  let [gridSize, setGridSize] = useState(20); //Tamaño de nuestro grid.
  const running = useRef(null);
  const [paused, setPaused] = useState(false); //Estado de pausa.
  const [simSpeed, setSimSpeed] = useState(1); //Para el segundo slider.
  const [density, setDensity] = useState(0.45) //Densidad para tercer slider, valor de 0.45.

  let setup = () => {
    console.log("Hola");
    fetch("http://localhost:8000/simulations", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dim: [gridSize, gridSize] })
    }).then(resp => resp.json())
    .then(data => {
      console.log(data);
      setLocation(data["Location"]);
      setTrees(data["trees"]); //Guardamos la ubicación y los datos de los árboles.
    });
  };

  const handleGridSizeSliderChange = (event, newValue) => {
    setGridSize(newValue);
  };

  const handleSimSpeedSliderChange = (event, newValue) => {
    setSimSpeed(newValue);
  };

  const handleDensitySliderChange = (event, newValue) => {
    setDensity(newValue);
  };


  const handleStart = () => {
    if (!location || running.current) return; 
    running.current = setInterval(() => {
      fetch("http://localhost:8000" + location)
      .then(res => res.json())
      .then(data => {
        setTrees(data["trees"]); //Update de React para los datos.
      });
    }, 1000 / simSpeed); //Velocidad del slider 2.
  };

  const handleStop = () => {
    clearInterval(running.current);
    running.current = null;
    setPaused(false);
  }

  const handlePause = () => { //Si está corriendo, lo pausa. Si no, lo resume.
  if (paused) {
    if (location) handleStart();
    setPaused(false);
  } else {
    clearInterval(running.current);
    running.current = null;
    setPaused(true);
  }
};

  //Cuenta la cantidad de árboles "quemándose"
  let burning = trees.filter(t => t.status == "burning").length;

  if (burning == 0 && running.current)
    handleStop(); //Si no hay, para la simulación.

  let offset = (500 - gridSize * 12) / 2;
  return (
    <>
      <div>
        <Button variant={"contained"} onClick={setup}>
          Setup
        </Button>
        <Button variant={"contained"} onClick={handleStart}>
          Start
        </Button>
        <Button variant={"contained"} onClick={handleStop}>
          Stop
        </Button>
        <Button variant={"contained"} onClick={handlePause}>
          Pause
        </Button>
      </div>
      <SliderField label="Grid size" min={10} max={40} step={10} type='number' value={gridSize} onChange={handleGridSizeSliderChange}/>
      <SliderField label="Simulation speed" min={10} max={40} step={10} type='number' value={simSpeed} onChange={handleSimSpeedSliderChange}/>
      <SliderField label="Density" min={0.1} max={1.0} step={0.05} type='number' value={density} onChange={handleDensitySliderChange}/>
      <svg width="500" height="500" xmlns="http://www.w3.org/2000/svg" style={{backgroundColor:"white"}}>
      {
        trees.map(tree => 
          <image 
            key={tree["id"]} 
            x={offset + 12*(tree["pos"][0] - 1)} 
            y={offset + 12*(tree["pos"][1] - 1)} 
            width={15} href={
              tree["status"] === "green" ? "./greentree.svg" :
              (tree["status"] === "burning" ? "./burningtree.svg" : 
                "./burnttree.svg")
            }
          />
        )
      }
      </svg>
    </>
  );
}

export default App