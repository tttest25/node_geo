const debug=1;

let myMap;
let myPlacemark;
let myData={ uik: [] };

ymaps.ready(init);

// -- NEW
function formatNum(param) {
  param2=parseFloat(param.replace(",", "."));
  if (Number.isInteger(param2)) {
    param = param2.toLocaleString('ru-RU')
  }
  return param;
}

function returnColor(str) {
  const regex = /%%(.+)%%/;
  let color;
  if ((m = regex.exec(str)) !== null) {
    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
      color = match;
    });
    return [str.replace(regex, ''), color];
  } else {
    return [str, null];
  }
}
// ---------------------------
function mapAddList(myMap) {
  // обновить
  const secondButton = new ymaps.control.Button("Обновить");
  myMap.controls.add(secondButton, {
    float: 'right'
  });

  // Создадим собственный макет выпадающего списка.
  let modeList = new ymaps.control.ListBox({
    data: {
      content: 'Данные',
      title: 'Данные, которые будут отражены на карте'
    },
    items: [
      new ymaps.control.ListBoxItem({ data: { content: 'УИК', mode: 1 }, options: { selectOnClick: false } }),
      new ymaps.control.ListBoxItem({ data: { content: 'Мероприятия', mode: 2 }, options: { selectOnClick: false } }),
      new ymaps.control.ListBoxItem({ data: { content: 'Ансамбли/библиотеки', mode: 3 }, options: { selectOnClick: false } }),
      new ymaps.control.ListBoxItem({ data: { content: 'Агит бригады', mode: 4 }, options: { selectOnClick: false } }),
      new ymaps.control.ListBoxItem({ data: { content: 'Резерв', mode: 5 }, options: { selectOnClick: false } }),
      new ymaps.control.ListBoxItem({ options: { type: 'separator' } }),
      new ymaps.control.ListBoxItem({ data: { content: 'Районы', mode: 10 }, options: { selectOnClick: false } }),
    ]
  });

  modeList.events.add('click', function (e) {
    // Получаем ссылку на объект, по которому кликнули.
    // События элементов списка пропагируются
    // и их можно слушать на родительском элементе.
    var item = e.get('target');
    // Клик на заголовке выпадающего списка обрабатывать не надо.
    if (item != modeList) {
      console.log('Menu click - set mode ', item.data.get('mode'), item.data.get('content'));
      switch (item.data.get('mode')) {
        case 1:
          mapUIK();
          break;
        case 2:
          mapMeropr();
          break;
        case 3:
          mapAnsam();
          break;
        case 4:
          mapAgit();
          break;
        case 5:
          mapReserve();
          break;
      }
    }
  });

  myMap.controls.add(modeList, { float: 'left' });
}

function uikDataLoad() {
  // загрузка данных по полигону
  let UikData;
  return fetch('/json/uik.json', { headers: { 'Cache-Control': 'no-cache' }}).then(res => res.json())
    .then((UikData) => {
      console.log('Загружены данные', UikData);
      // обработка
      UikData.values.forEach((data) => { myData.uik.push(data); });
    })
    .catch(console.warn);
}


function mapPolygonLoad() {
  // загрузка данных по полигону
  let CountyData;
  return fetch('/CountyData.json').then(res => res.json())
    .then((CountyData) => {
      console.log('Загружены данные', CountyData);
      // обработка
      let count = CountyData.features.length - 1;
      let  i = 0;
      myMap.geoObjects.options.set({
        fillColor: CountyData.features[0].options.fillColor,
        fillOpacity: CountyData.features[0].options.fillOpacity,
      });

      for (i = count; i >= 0; i--) {
        const object = CountyData.features[i];
        // Добавляем id в properties,
        // чтобы в дальнейшем получить информацию о депутате района
        object.properties.number = object.id;
        myMap.geoObjects.add(new ymaps.GeoObject({
          geometry: object.geometry,
          properties: object.properties,
        }, object.options));
      }

      const countCounty = myMap.geoObjects.getLength();
      const currentCountyIndex = Math.floor(Math.random() * (countCounty - 1) + 1);
      myMap.geoObjects.each((geoObject) => {
        if (geoObject.properties.get('number') == currentCountyIndex) {
          geoObject.events.fire('click');
        }
      });
    })
    .catch(console.warn);

}

// const reducer = (accumulator, currentValue) => { return (accumulator +  currentValue.join(' ') ") };


function mapShowInfoObjNum(objNum) {
  let filtUik = myData.uik.filter(k => k[0] == objNum);

  htmlInfo = filtUik.map((currentValue, index, array) => {
    return currentValue.map((currentValue, index, array) => {
      return index > 1 ? currentValue : '';
    }).join("\n");
  }).join("\n---\n");
  // htmlInfo = filtUik.reduce(reducer);
  //console.log('mapShowInfo',filtUik,htmlInfo);
  const str = `Информация об объекте: ${objNum} <br> <pre>${htmlInfo}</pre>`;
  document.getElementById('mapInfo').innerHTML = str;
}

function mapMeropr() {
  mapClearAll();
  mapPolygonLoad();
  addMarkersUniv("meropr","Мероприятия");
}

function mapAnsam() {
  mapClearAll();
  mapPolygonLoad();
  addMarkersUniv("ansam","Ансамбли");
}

function mapUIK() {
  mapClearAll();
  mapPolygonLoad();
  addMarkersUniv("district","УИКИ"); 
}

function mapAgit() {
  mapClearAll();
  mapPolygonLoad();
  addMarkersUniv("agit","Агитационные бригады");
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


function init() {
  // myMap = new ymaps.Map("map", {
  //     center: [58.030374, 56.239398],
  //     zoom: 12
  // });
  myMap = new ymaps.Map('map', {
    center: [58.00870305342682, 56.41197666796872],
    controls: ['zoomControl'],
    type: '',
    zoom: 10,
  }, {
    minZoom: 10,
    maxZoom: 19,
    // ,restrictMapArea                 : true
    searchControlProvider: 'yandex#map',
    suppressMapOpenBlock: true,
    suppressObsoleteBrowserNotifier: true,
  });

  myMap.controls.add('searchControl', {
    useMapBounds: true,
    resultsPerPage: 5,
    noSelect: true,
    suppressYandexSearch: true,
    provider: 'yandex#map',
    placeholderContent: 'Введите название улицы и № дома',
  });

  

  const searchControl = myMap.controls.get('searchControl');

  searchControl.events.add(
    'submit',
    (event) => {
      if (myMap.getZoom() == 10) {
        myMap.setZoom(11);
      }
    },
  );

  searchControl.events
    .add(
      'load',
      (event) => {
        if (!event.get('skip') && searchControl.getResultsCount()) {
          searchControl.showResult(0);
        }
      },
    );
/*    .add(
      'resultselect',
      (event) => {
        const result = searchControl.getResultsArray()[event.get('index')];
        myMap.geoObjects.each((geoObject) => {
          if (geoObject.geometry.contains(result.geometry.getCoordinates())) {
            console.log(geoObject.properties.get('number'));
            //geoObject.events.fire('click');
          }
        });
      },
    );*/

  myMap.events.add(
    'boundschange',
    () => {
      myMap.setType(myMap.getZoom() >= 11 ? 'yandex#map' : '');
      if (myMap.getZoom() >= 11) {
        myMap.geoObjects.each((object) => {
          object.options.set({
            /* fillColor: 'rgba(242, 241, 235, 0.6)', */
            strokeWidth: 2,
          });
        });
      } else {
        myMap.geoObjects.each((object) => {
          object.options.set({
            /* fillColor: 'rgba(242, 241, 235, 0.7)', */
            strokeWidth: 1,
          });
        });
      }
    },
  );

  myMap.behaviors.disable('scrollZoom');
  myMap.cursors.push('zoom');

  // Меню для выбора режима карты 
  mapAddList(myMap);

  // Загрузить полигоны районов
  mapPolygonLoad();
  // Загрузить данные по адресам/уикам
  uikDataLoad();
  // навесить обработчики + *
  addCupdate();
  // отобразить УИК
  addMarkersUIK();
  // заполнить таблицу
  resTableFill();
  // навесить обработчики на карту
  mapSetClick();
  // Запустить обновление таблицы по таймеру 1раз в 60 секунд
  timerUpdate()
}

function timerUpdate() {
  setInterval(() => {
    console.log('timerUpdate.Update start');
    if (debug) {
      console.log('Debug timerUpdate stop - after File update - resTablefill'); 
      resTableFill();
    } else {
      Update().then((a) => {console.log('timerUpdate stop - after File update - resTablefill',a); resTableFill();});
    }
  }, 60000);
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

function resTableClear() {
  document.getElementById('resBody').innerHTML = '';
}

function resTableFill() {
  // document.getElementById('resBody').innerHTML="";
  fetch('./json/table.json', { headers: { 'Cache-Control': 'no-cache' } })
    .then((response) => {
      if (response.status !== 200) {
        console.log(`Looks like there was a problem. Status Code: ${response.status}`);
        return;
      }
      let sRows = '<tr>';
      // Examine the text in the response
      let col;
      let arr=[];
      response.json().then((data) => {
        for (const row of data.values) {
          for (const value of row) {
            arr=returnColor(value);
            col=arr[1];
            sRows += col?`<td color="${col}">${formatNum(arr[0])}</td>`:`<td>${formatNum(arr[0])}</td>`;
          }
          sRows += '</tr>';
        }
        document.getElementById('resBody').innerHTML = sRows;
      });
    })
    .catch((err) => {
      console.log('Fetch Error :-S', err);
    });
}

function addCupdate() {
  document.getElementById('cresTableFill').onclick = (() => { resTableFill(); });
  document.getElementById('cUpdate').onclick = (() => { fUpdate(); });
}

function addMarkersUIK() {
  const reFilter = new RegExp(document.getElementById('tFilter').value); 
  const filterLen = document.getElementById('tFilter').value.length;

  fetch('./json/district.json', { headers: { 'Cache-Control': 'no-cache' } })
    .then((response) => {
      if (response.status !== 200) {
        console.log(`Looks like there was a problem. Status Code: ${response.status}`);
        return;
      }
      // Examine the text in the response
      response.json().then((data) => {
        // console.log(data);
        data.values.forEach((item, index, array) => {
          // console.log(item, index);
          if (filterLen<3 || (filterLen>3 && reFilter.test(item.join(' ')))) {
            myMap.geoObjects.add(new ymaps.Placemark([item[5], item[6]], { balloonContent: `${item[0]} ${item[1]} ${item[2]}  ${item[3]} ${item[4]}`, number: item[0] }, { preset: 'islands#circleIcon', iconColor: item[7] }));
          }
        });
      });
    })
    .catch((err) => {
      console.log('Fetch Error :-S', err);
    });
}

function addMarkersMeropr() {
  const reFilter = new RegExp(document.getElementById('tFilter').value, 'i'); 
  const filterLen = document.getElementById('tFilter').value.length;
  fetch('./json/meropr.json', { headers: { 'Cache-Control': 'no-cache' } })
    .then((response) => {
      if (response.status !== 200) {
        console.log(`Looks like there was a problem. Status Code: ${response.status}`);
        return;
      }
      // Examine the text in the response
      response.json().then((data) => {
        // console.log(data);
        data.values.forEach((item, index, array) => {
          // conso  le.log(item, index);
          if (filterLen<3 || (filterLen>3 && reFilter.test(item.join(' ')))) {
            myMap.geoObjects.add(new ymaps.Placemark([item[5], item[6]], { balloonContent: `${item[0]} ${item[1]} ${item[2]} ${item[4]} `, number: item[0] }, { preset: 'islands#blueCircusCircleIcon', iconColor: item[7] }));
          }
          
        });
      });
    })
    .catch((err) => {
      console.log('Fetch Error :-S', err);
    });
}


function addMarkersAnsam() {
  // ansambl
  //  0    1    2                           3                      4        5        6        7            8
  // 432	СР	МАОУ «Средняя общеобразоват	"Мобильная библиотека 	3473	57.981029	56.293026	#c1c0bc	islands#blueBookCircleIcon'
  
  const reFilter = new RegExp(document.getElementById('tFilter').value, 'i'); 
  const filterLen = document.getElementById('tFilter').value.length;

  fetch('./json/ansam.json', { headers: { 'Cache-Control': 'no-cache' } })
    .then((response) => {
      if (response.status !== 200) {
        console.log(`Looks like there was a problem. Status Code: ${response.status}`);
        return;
      }
      // Examine the text in the response
      response.json().then((data) => {
        // console.log(data);
        data.values.forEach((item, index, array) => {
          // conso  le.log(item, index);
          if (filterLen<3 || (filterLen>3 && reFilter.test(item.join(' ')))) {
            myMap.geoObjects.add(new ymaps.Placemark([item[5], item[6]], { balloonContent: `${item[0]} ${item[1]} ${item[2]} ${item[4]} `, number: item[0] }, { preset: (typeof item[8] === 'undefined') ? 'islands#blueCircusCircleIcon' : item[8], iconColor: item[7] }));
          }
          
        });
      });
    })
    .catch((err) => {
      console.log('Fetch Error :-S', err);
    });
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

