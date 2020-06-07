# Проект гео карта на google sheet
docker build --build-arg PORT=3001  -t mea/node-web-geo-img . --no-cache
docker run -it --rm --name node-web-geo  mea/node-web-geo-img
docker run -it --mount type=bind,source="$(pwd)",target=/opt/node_app/app --rm --name node-web-geo  -p 3001:3001   mea/node-web-geo-img bash

# 1 как добавить объекты и проверить  принадлежность точки полигону
// Орджо
coord = [
        [                
                    [58.07243548442144  , 56.33102394648219],
                    [58.060655490966155 , 56.5458547087979 ],
                    [58.11829247615229  , 56.56061758721606],
                    [58.121991569834535 , 56.55350749723229],
                    [58.14062969422554  , 56.53118752078284],
                    [58.15058036795182  , 56.51848258016549],
                    [58.155447101513225 , 56.50028447548575],
                    [58.15290625405842  , 56.47487859169681],
                    [58.158350704221114 , 56.45015935341559],
                    [58.15150013197533  , 56.39522289013511],
                    [58.1788964655448   , 56.29668925976437],
                    [58.16452192016983  , 56.25972295300683],
                    [58.16350200377767  , 56.251539482245235],
                    [58.155370568206195 , 56.24710442411054],
                    [58.15674884708594  , 56.2321839531487 ],
                    [58.093828860638666 , 56.21245696363215],
                    [58.085709356992304 , 56.26701899023041],
                    [58.07758799846942  , 56.31059468870379],
                    [58.05636914771755  , 56.30035861886974],
                    [58.0565925239608   , 56.30784792413746],
                    [58.07592769919329  , 56.317952476512076],
                    [58.096343094928606 , 56.32393715583983],
                    [58.09599617089361  , 56.34269571445131],
                    [58.08712721356968  , 56.34406960829878],
                    [58.07243548442144  , 56.33102394648219]
            ]
        ];

var myPolygon = new ymaps.geometry.Polygon(coord);

myPolygon.options.setParent(myMap.options);
myPolygon.setMap(myMap);

let point = new ymaps.geometry.Point([58.15, 56.32]);
point.options.setParent(myMap.options);
point.setMap(myMap);
myPolygon.contains([58.15, 56.32]);

// add to map
function myAddPoint (param) {
let vPoint = new ymaps.Placemark( param, {
            balloonContent: 'цвет <strong>воды пляжа бонди</strong>'
        }, {
            preset: 'islands#circleIcon',
            iconColor: '#0095b6'
        });
    myMap.geoObjects.add(vPoint);
    console.log(vPoint);
}

myAddPoint( [58.15, 56.32])
myAddPoint( [58.093828860638666 , 56.21245696363215])
myAddPoint( [58.085709356992304 , 56.26701899023041])
myAddPoint( [58.07758799846942 , 56.31059468870379])

///////////////////////////////////////
myPolygon = myMap.geoObjects.get(0);
myPolygon.properties.getAll();
objs.filter( a => myPolygon.geometry.contains(a.geometry.getCoordinates())).map( a => 
    {return {id:a.properties.get('number') , dist: myPolygon.properties.get('hintContent')}})
.forEach(element => console.log(element));
///////////////////////////////////////
// add polygon

// Создаем многоугольник, используя класс GeoObject.
    var myGeoObject = new ymaps.GeoObject({
        // Описываем геометрию геообъекта.
        geometry: {
            // Тип геометрии - "Многоугольник".
            type: "Polygon",
            // Указываем координаты вершин многоугольника.
            coordinates: coord,
            // Задаем правило заливки внутренних контуров по алгоритму "nonZero".
            fillRule: "nonZero"
        },
        // Описываем свойства геообъекта.
        properties:{
            // Содержимое балуна.
            balloonContent: "Многоугольник"
        }
    }, {
        // Описываем опции геообъекта.
        // Цвет заливки.
        fillColor: '#00FF00',
        // Цвет обводки.
        strokeColor: '#0000FF',
        // Общая прозрачность (как для заливки, так и для обводки).
        opacity: 0.5,
        // Ширина обводки.
        strokeWidth: 5,
        // Стиль обводки.
        strokeStyle: 'shortdash'
    });

    // Добавляем многоугольник на карту.
    myMap.geoObjects.add(myGeoObject);


# 2 get all objects on map and process to polygon constains


function getContains(pObj, pPoly) {
   if ( pPoly.geometry.contains(pObj.geometry.getCoordinates())) 
     { return pPoly.properties.get('hintContent'); } 
   else 
     { return null; }
}


myMap.geoObjects.each(function (geoObject) {
    var distr=[];
    if (geoObject.properties.get('number').length > 2 ) {
        // do something
        for (let value of [0,1,2,3,4,5,6]) { // get all districts and check for object in it
          distr.push(getContains(geoObject, myMap.geoObjects.get(value)));
          }
        console.log(`geo \t ${geoObject.properties.get('number')} \t ${distr}`);
        return true;
    }
});
