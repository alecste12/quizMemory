
var quiz;
import { nCategory } from "./cube.js";
import Cube from "./cube.js";
import { camera, scene } from "./game.js";
import { cube } from "./game.js";

export let isPenalty;
let isFetching = false;
let category = [27,23,17,11,15,31] //27 animali 23 storia 17 scienze e natura 11 film 15 video games 31 manga
let secondChance = true; //attiva/disattiva in base a che livello di difficoltà vuoi giocare 
var posizioneRisposta;


class Quiz{
    constructor(data){
        this.difficulty = data.results[0].difficulty;
        this.category = data.results[0].category;
        this.question = data.results[0].question;
        this.answer = [];
        this.answer.push(data.results[0].correct_answer);
        for(let i=0; i<data.results[0].incorrect_answers.length; i++){
                this.answer.push(data.results[0].incorrect_answers[i]);
        }
    }
    
}

//vengono prese le domande con la fetch
 function fetchData() {
    //uscita di controllo per non avere problemi che mi carica domande all'infinito
    if (isFetching) {
        return; 
    }
    isFetching = true;
    //creazione quiz
    document.getElementById("res").innerHTML+="<form name='questionario' >"+
    "<div id='answer1'>"+
        "<input type='radio' name='risposta' id='risposta1'>"+
    "</div>"+
    "<div id='answer2'>"+
        "<input type='radio' name='risposta' id='risposta2' >"+
    "</div>"+
    "<div id='answer3'>"+
        "<input type='radio'name='risposta' id='risposta3' >"+
    "</div>"+
    "<div id='answer4'>"+
        "<input type='radio' name='risposta' id='risposta4'>"+
    "</div>"+
    "</form>"+ "<button id='myBtn' >"+"CheckAnswer"+"</button>";

    document.getElementById("myBtn").addEventListener("click", checkAnswer);
    
    //recupero domande + categoria scelta dal colore del cubo che è uscito
    fetch('https://opentdb.com/api.php?amount=1&category='+String(category[nCategory]))
        .then((response) => response.json())
        .then((d) => {
            isFetching = false;
            document.getElementById("loadErr").style.display="none";
            quiz = new Quiz(d);
        
        
            document.getElementById("domanda").innerHTML=quiz.question;
            
            //se è un quiz true e false    
            if(quiz.answer.length==2){
                secondChance=false;
                document.getElementById("answer3").style.display = "none";
                document.getElementById("answer4").style.display = "none";
            
            }
            posizioneRisposta = parseInt(Math.random()*quiz.answer.length)
        
            let cur = 1;
            for(let i = 0; i<quiz.answer.length; i++ ){
            
                if(i==posizioneRisposta){
                
                    let lab = document.createElement("label");
                    lab.innerText = quiz.answer[0];
            
                    document.getElementById("answer"+(i+1)).appendChild(lab);
                    document.getElementById("risposta"+(i+1)).value=quiz.answer[0];
                
                }
                else{
                    let lab = document.createElement("label");
                    lab.innerText = quiz.answer[cur];
                
                    document.getElementById("answer"+(i+1)).appendChild(lab);
                    cur++;
                }

            }
        
        
      
        })
        //in caso di errore nel caricamento della domanda
        .catch(error=>{     
            isFetching = false;
            document.getElementById("res").innerHTML="<div id='loadErr'>"+"Loading..."+"</div>";
            fetchData();
                            
        })
                            

}

function checkAnswer(){    
    for(let i=1; i<5; i++){
        if(document.getElementById("risposta"+i).checked){
            //se risposta selezionata è giusta
            if(document.getElementById("risposta"+i).value== quiz.answer[0]){
                document.getElementById("answer"+(posizioneRisposta+1)).style.backgroundColor= "green";
                window.postMessage({ type: 'changeGamePaused', value: false }, '*'); //il gioco può riprendere
                setTimeout(nascondiDomanda,1000);
                cube.removeText();  //toglie la scritta della categoria
                isPenalty= false;
                console.log(isPenalty)
            }
            //se risposta selezionata è sbagliata
            else{
                
                document.getElementById("answer"+i).style.backgroundColor= "red";
                isPenalty = true; //ci sarà una penalità
                console.log(isPenalty)

                if(!secondChance){
                    
                    document.getElementById("answer"+(posizioneRisposta+1)).style.backgroundColor= "green";
                    secondChance=true;
                    window.postMessage({ type: 'rollDice'}, '*');//fa di nuovo ruotare il dado
                    cube.removeText();// toglie la scritta della categoria
                    setInterval(()=>{isPenalty=false;},1000);  
                    setTimeout(caricaDomanda,1000);
                
                }else{
                    
                    document.getElementById("loadErr").style.display="block";
                    document.getElementById("loadErr").innerHTML="<p>"+"Second Chance!"+"</p>";
                    setInterval(()=>{isPenalty=false;},1000);
                    secondChance=false;
                }
               
                

            }
        }
    }    
    
   
        
       
        
    
}




export function caricaDomanda(){
    
    nascondiDomanda();
    fetchData();
    
}
function nascondiDomanda(){
    
    document.getElementById("domanda").innerHTML=null;
    document.getElementById("res").innerHTML=null;
    

}
