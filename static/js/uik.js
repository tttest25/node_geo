
let myMap;
let myPlacemark;
let myData={ uik: [], address: [] };

function headerUIK() {
  return [
    ['№','Район','Название','Адрес','УИКИ','Широта','Долгота'] ['детали-','УИК','избирателей','явка',',',',','район']
  ];
}

function formatRow(arr) {
  return arr.filter((el, ind) => [0, 1, 2, 3, 4, 5, 6].includes(ind));
}

function timerUpdate() {
  setInterval(() => {
    console.log('timerUpdate.Update start');
    fUpdate().then((a) => {console.log('timerUpdate stop - after File update - resTablefill',a); resTableFill();});
  }, 60000);
}


function loadUikData() {
  // загрузка данных по полигону
  let UikData;
  return fetch('/json/uik.json', { headers: { 'Cache-Control': 'no-cache' } }).then(res => res.json())
    .then((UikData) => {
      console.log('Загружены данные', UikData);
      // обработка
      let promise = new Promise((resolve, reject) => {
        UikData.values.forEach((data) => { myData.uik.push(data); });
        resolve("result");    
      });
      return promise;
    })
    .catch(console.warn);
}

function loadAddressData() {
  return fetch('./json/district.json', { headers: { 'Cache-Control': 'no-cache' } })
    .then((response) => {
      if (response.status !== 200) {
        console.log(`Looks like there was a problem. Status Code: ${response.status}`);
        return;
      }
      // Examine the text in the response
        return response.json().then((data) => {
        console.log('Load adress', data);
        myData.address = data.values;
        /*data.values.forEach((item, index, array) => {
          // console.log(item, index);
            myData.address.push(item);

        });}*/
      });
    })
    .catch((err) => {
      console.log('Fetch Error :-S', err);
    });
}


function fUpdate () {
  return fetch('./update')
    .then((response) => {
      if (response.status !== 200) {
        console.log(`Looks like there was a problem. Status Code: ${response.status}`);
      }
      // Examine the text in the response
      response.text().then((data) => {
        console.log(data);
      });
    })
    .catch((err) => {
      console.log('Fetch Error :-S', err);
    });
}

function TableClear() {
  document.getElementById('resBody').innerHTML = '';
}

function showHeadData(head,detail) {
  // console.log(head,detail);
  const REGEX = /\*/y;
  let arr;
  let sRows = '';  
  // document.getElementById('resBody').innerHTML="";
  // Examine the text in the response
  for (const row of head) {
      sRows += '<tr>';  
      for (const value of row) {
        sRows += REGEX.test(value) ? `<th class="red">${value}</th>` : `<th>${value}</th>`;
        }
      sRows += '</tr>';
    
  }
  if(typeof detail === 'object') {
    htmlInfo = detail.map((currentValue, index, array) => {
        let row=currentValue.map((currentValue, index, array) => {
          return `<td>${currentValue}</td>`;
        }).join(' ');
        return `<tr>${row}</tr>`;
      }).join(' ');
      sRows +=`<tr><td>-</td><th colspan="100"><table class="detail">${htmlInfo}</table></th></tr>`;
    }
  
  document.getElementById('resHead').innerHTML = sRows;
}


function showTableData() {
  const filterValue = document.getElementById('tFilter').value;
  const reFilter = new RegExp(filterValue, 'i');
  const filterLen = filterValue.length;

  //document.getElementById('modeCapt').innerHTML = `Режим ${pModeCapt} (${(filterLen > 3) ? filterValue : '-'})`;

  const REGEX = /\*/y;
  let arr;
  // document.getElementById('resBody').innerHTML="";
  let sRows = '';
  // if (filterLen<3 || (filterLen>3 && reFilter.test(item.join(' ')))) {
  // Examine the text in the response
  for (const row of myData.address) {
    arr = mapShowInfoObjNum(row[0]);
    //console.log(arr);
    if (filterLen < 3 || (filterLen > 3 && reFilter.test(row.join(' '))) || (filterLen > 3 &&  reFilter.test(arr.join(' ')))) {
      // console.log(row.join(' '), arr.join(' '));
      sRows += '<tr>';
      //console.log('String row format',row);

      for (const value of formatRow(row)) {
        if (filterLen < 3 || (filterLen > 3 && reFilter.test(row.join(' '))) || (filterLen > 3 &&  reFilter.test(arr.join(' ')))) {
        sRows += REGEX.test(value) ? `<td class="red">${value}</td>` : `<td>${value}</td>`;

      }
      sRows += '</tr>';
      htmlInfo = arr.map((currentValue, index, array) => {
        let row = currentValue.map((currentValue, index, array) => {
          return index > 1 ? `<td>${currentValue}</td>` : '';
        }).join(' ');
        return `<tr>${row}</tr>`;
      }).join(' ');
      sRows += `<tr><td>-</td><td colspan="100"><table class="detail">${htmlInfo}</table></td></tr>`;
    }
  }
  document.getElementById('resBody').innerHTML = sRows;
}


function addCupdate() {
  document.getElementById('btnOk').onclick = (() => { fillTable(); });
  document.getElementById('cresTableFill').onclick = (() => { fillTable(); });
  document.getElementById('cUpdate').onclick = (() => { fUpdate(); });
  
  document.getElementById("tFilter").addEventListener("keyup", function(event) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Trigger the button element with a click
      document.getElementById("btnOk").click();
    }
  });
}

function fillTable() {
  console.log('Filltable');
  TableClear();
  showHeadData([["№","Район","Название","Адрес","УИКИ","Широта","Долгота"]],[["УИК","избирателей","явка","","","","","район"]]);
  showTableData();
}

// ------------------------------------------------------------------------------------------------------

function mapShowInfoObjNum(objNum) {
  let filtUik = myData.uik.filter(k => k[0] == objNum);
  return filtUik;
  // htmlInfo = filtUik.map((currentValue, index, array) => {
  //   return currentValue.map((currentValue, index, array) => {
  //     return index > 1 ? currentValue : '';
  //   }).join("\n");
  // }).join("\n---\n");
  // // htmlInfo = filtUik.reduce(reducer);
  //console.log('mapShowInfo',filtUik,htmlInfo);
  // const str = `Информация об объекте: ${objNum} <br> <pre>${htmlInfo}</pre>`;
  // document.getElementById('mapInfo').innerHTML = str;
}

function mapReserve() {
  mapClearAll();
  mapPolygonLoad();
  addMarkersUniv("reserve","Резервные пункты");
}

function mapSetClick() {
  myMap.geoObjects.events.add(
    'click', (e) => {
      const thisPolygon = e.get('target');
      const objNum=thisPolygon.properties.get('number');
      console.log('click on geo prop_number: ', objNum);
      mapShowInfoObjNum(objNum);
    }
  );
}


// - универсальна процедура для загрузки маркеров на карту 
function addMarkersUniv(pMode , pModeCapt) {
  // ansambl
  //  0    1    2                           3                      4        5        6        7            8
  // 432	СР	МАОУ «Средняя общеобразоват	"Мобильная библиотека 	3473	57.981029	56.293026	#c1c0bc	islands#blueBookCircleIcon'
  const filterValue = document.getElementById('tFilter').value;
  const reFilter = new RegExp(filterValue, 'i'); 
  const filterLen = filterValue.length;

  document.getElementById('modeCapt').innerHTML = `Режим ${pModeCapt} (${(filterLen > 3) ? filterValue : '-'})`;

  fetch(`./json/${pMode}.json`, { headers: { 'Cache-Control': 'no-cache' } })
    .then((response) => {
      if (response.status !== 200) {
        console.log(`addMarkers ${pMode} Looks like there was a problem. Status Code: ${response.status}`);
        return;
      }
      // Examine the text in the response
      response.json().then((data) => {
        // console.log(data);
        data.values.forEach((item, index, array) => {
          // conso  le.log(item, index);
          if (filterLen<3 || (filterLen>3 && reFilter.test(item.join(' ')))) {
            myMap.geoObjects.add(new ymaps.Placemark([item[5], item[6]], { balloonContent: `${item[0]} ${item[1]} ${item[2]} <br> ${item[3]} <br> ${item[4]} `, number: item[0] }, { preset: (typeof item[8] === 'undefined') ? 'islands#blueCircusCircleIcon' : item[8], iconColor: item[7] }));
          }
        });
      });
    })
    .catch((err) => {
      console.log('Fetch Error :-S', err);
    });
}

function mapClearAll() {
  myMap.geoObjects.removeAll();
  document.getElementById('mapInfo').innerHTML = '';
}


function init() {
  // Загрузить полигоны районов
  loadAddressData().then((a) => {
    console.log('init- load data',a)
    return loadUikData();
  }).then((a) => {
    console.log('init- load uik',a);
    fillTable();
  });

  //   // отобразить УИК
//  addMarkersUIK();

//   // навесить обработчики + *
   addCupdate();
//   // заполнить таблицу
//   resTableFill();
//   // навесить обработчики на карту
//   mapSetClick();
//   // Запустить обновление таблицы по таймеру 1раз в 60 секунд
//   timerUpdate()
}

function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(init);
