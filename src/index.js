const express=require("express");
const path=require("path");
const app=express();
const hbs=require("hbs");
var requests = require('requests');
const port = process.env.PORT || 8000;

// staic page
const staticPath=path.join(__dirname, "../public");
app.use(express.static(staticPath));

// view engine
app.set("view engine", 'hbs');
app.set("views","./templates/views");

// partials
hbs.registerPartials(path.join(__dirname, "../templates/partials"))

// about us
app.get("/about",(req,res)=>{
    res.render("about");
});

let city="Pune";
let datas={
    name: "NA",
    sys: {
        country: "NA"
    },
    main: {
        temp: 0
    },
    weather: [{
        main: "NA",
        id: 800
    }],
    wind: {
        speed : 0
    }
};
app.get("/data",(req,res)=>{
    city=req.query.city;
    res.json(datas);
    res.end();
});
// let jsondata={
//     "200-232": 1,
//     "300-321;500-531": 5,
//     "800": 2,
//     "801": 7,
//     "802": 4,
//     "803-804": 3,
//     "600-622": 8
// }
const mapping=(id, time)=>{
    if(id>199 && id< 233)
        return 1;
    if(id===800){
        let d=new Date();
        let hrs=parseInt(d.toTimeString().substr(0,2));
        if((hrs>=0 && hrs <=6) || (hrs>=18 && hrs <=24)){
            return 2;
        }
        if((hrs>=6 && hrs <=18)){
            return 6;
        }
    }
    if(id===801)
        return 7;
    if(id===802)
        return 4;
    if(id>802 && id<805)
        return 3;
    if(id>599 && id<623)
        return 8;
    if((id===701) || (id===711) || (id===721) || (id===731) || (id===741) || (id===751) || (id===761) || (id===762) || (id===771) || (id===781))
        return 9;
    if((id>299 && id<322) || (id>499 && id<532))
        return 5;
}

// weather 
app.get("/weather",(req,res)=>{
    requests(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=c54de9945100d45bfd5df7ee86a49d67`)
    .on('data', function (chunk) {
        let s=JSON.parse(chunk);
        if(s.cod === 200){
            //console.log(s);
            datas=s;
            city=s.name;
        }
    })
    .on('end', function (err) {
        if (err) 
            return console.log('connection closed due to errors', err);
        res.render("index",{
            location: `${datas.name}, ${datas.sys.country}`,
            temp: datas.main.temp,
            tempStatus: datas.weather[0].main,
            speed: datas.wind.speed,
            humidity: datas.main.humidity,
            img: mapping(datas.weather[0].id)
        });
    });
});

// 404
app.get("*",(req,res)=>{
    res.status(404).send("<h1> 400 error</h1>");
});

// listening
app.listen(port, (err)=>{
    if(err)
        console.log("err ",err);
    console.log("listening at port 8000");
})