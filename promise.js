 
 /*function walkDog(){
    // Write your Promise logic here
}
console.log(greet());
///////////////////////
function normal() {
    return "A";
}

async function asyncFunc() {
    return "B";
}

console.log(normal());
console.log(asyncFunc());
// this is also show the key difference between the function and async function


try {
    let x=y+5;
}catch(error) {
    console.log("error happend please fix it");
}
// the above small code shows simply the try and catch methods


 function walkDog(){

 }
 function cleanKitchen(){

 }
function takeOutTrash(){

}
async function doChores(){
    const walkDogResult= await walkDog();
    console.log(walkDogResult);

    const cleanKitchenResult= await cleanKitchen();
    console.log(cleanKitchenResult);

    const takeOutTrashResult= await takeOutTrash();
     console.log(takeOutTrashResult);
}
doChores()
// the above cod will not work when we run it since the functions are empty




 function walkDog(){
    return new Promise(resolve => {
        setTimeout(() => {
            resolve("You walked the dog");
        }, 1500);
    });
}
 function cleanKitchen(){
    return new Promise(resolve =>{ 
        setTimeout(() =>{
            resolve("You cleaned the kitchen");
        },2000);
    });
 }
function takeOutTrash(){
    return new Promise(resolve => { 
        setTimeout(() => {
            resolve("You took out the trash");
        }, 500);
    });
}

async function doChores(){
    try {
        const walkDogResult= await walkDog();
    console.log(walkDogResult);

    const cleanKitchenResult= await cleanKitchen();
    console.log(cleanKitchenResult);

    const takeOutTrashResult= await takeOutTrash();
     console.log(takeOutTrashResult);
     
    }catch(error){
        console.log(error);
    }

    }
  
doChores()
  ///////////////////////////////////

// promises 
function walkDog(callback){
    setTimeout(() =>{
console.log("you walked the dog");
callback();
    },1500);
}
function cleanKitchen(callback){
    setTimeout(() =>{
        console.log("you clean the kitchen");
        callback();
    },2500);
}
function takeOutTrash(calback){
    setTimeout(() =>{
        console.log("you take out the trash");
        callback();
    },500);
}

walkDog(() =>{
    cleanKitchen(() =>{
        takeOutTrash(() =>{
            cosole.log("you finished the chores");
        })
    })
})
    ////////////////////////////




   function walkDog(){
    return new Promise((resolve,reject) =>{
        setTimeout(() =>{
            resolve("you walked the dog");
        },1500);

    });
   }

   function cleanKitchen(){
    return new Promise((resolve,reject) =>{
        setTimeout(() =>{
            resolve("you cleaned the kitchen");
            
        },2500);
    });
   }

   function takeOutTrash(){
    return new Promise((resolve,reject) =>{
        setTimeout(() =>{
            resolve("you took out the trash");
        },500);
    });
   }
walkDog().then(value => {console.log(value);return cleanKitchen()})
         .then(value => {console.log(value);return takeOutTrash()})
         //.then(value =>console.log(value))
         .then(value => {console.log(value); console.log("you finished all the chores")})
//NB promise P shoud be capital letter
// and the above code is done with only the resolve method
// so lets try by both resolve and reject methods in the code below

//////////////////////////////////////////


function walkDog(){
    return new Promise((resolve,reject) =>{
        setTimeout(() =>{
           const walkedDog=true; 
           if(walkedDog){
                        resolve("you walked the dog");

           }
           else{
            reject("you did not walk the dog");
           }
        
        },1500);

    });
   }

   function cleanKitchen(){
    return new Promise((resolve,reject) =>{
        setTimeout(() =>{
            const cleanedKitchen=true;
            if(cleanedKitchen){

                resolve("you cleaned the kitchen");
            }
            else {
                reject("you did not cleaned the kitchen");
            }

            
        },2500);
    });
   }

   function takeOutTrash(){
    return new Promise((resolve,reject) =>{
        setTimeout(() =>{
            const trashTakenOut=false;
            if(trashTakenOut){
                resolve("you took oot the trash");
            }
            else {
                reject("you did not take out the trash");
            }
        },500);
    });
   }
walkDog().then(value => {console.log(value);return cleanKitchen()})
         .then(value => {console.log(value);return takeOutTrash()})
         //.then(value =>console.log(value))
         .then(value => {console.log(value); console.log("you finished all the chores")})
         .catch(error => console.log(error));
// the above code is called error handling method 
//////////////////////////////////////////////
let task = new Promise((resolve, reject) => {
    resolve(2);
});

task
.then(num => {
    console.log("Step 1:", num);
    return num * 2;
})
.then(num => {
    console.log("Step 2:", num);
    throw new Error("Something went wrong!");
})
.then(num => {
    console.log("Step 3:", num); // ❌ skipped
})
.catch(error => {
    console.log("Error caught:", error.message);
});
//////////////////////////////////////

//////////////////////////////
function step1(){
    return Promise.resolve("step 1 done")
}
function step2() {
    return Promise.resolve("step2 done")
}

function step3(){
        return Promise.resolve("step3 done")
}
step1().then(value =>{console.log(value); return step2()})
       .then(value =>{console.log(value); return step3()})
       .then(value =>{console.log(value)})

////////////
// try, catch.and finnally blocks, 
//but in the code below node.js doesn't run on browser(window) so we can not type 
//you can run it by linking with the html file and the js file to see the result,
// only the last line of code of result we will see 
try{
   const dividend= Number(window.prompt("enter the dividend")
);
const divisor= Number(window.prompt("enter the divisor"));
if (divisor==0){
    throw new Error("please the is is wrong value");
    // and if we entered a value that is not a number it says NAN So SEE THE IF BELOW
}
if(isNaN(dividend) || isNaN(divisor)){
    throw new Error("the values must be numbers");// if we typed not number values we will get this text
}
const result =dividend/divisor;
console.log(result); 
}
catch(error){
    console.error(error.message);
}
console.log("you have reached the end");
////////////////////////////////////
*/
function getWeather() {
    return new Promise((resolve,reject) =>{
        let Weather =["sunny","cloudy","rainy"];
        let random=Math.random();
        if(random > 0.2){
            resolve(Weather[Math.floor(Math.random()*Weather.length)]);
        } else {
            reject("weather service is not availiable");
        }
    });
    
}
getWeather()
  .then(result =>console.log(result))
  .catch(error =>console.error(error))
