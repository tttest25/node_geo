/* global ymaps, document, fetch */
/* eslint no-undef: "error" */
/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

let myMap;
// let myPlacemark;
const myData = {
  uik: [],
  mode: undefined,
};


// -- NEW
function formatNum(param) {
  const param2 = parseFloat(param.replace(',', '.'));
  if (Number.isInteger(param2)) {
    param = param2.toLocaleString('ru-RU');
  }
  return param;
}

// ---------------------------

const eInfopanel = () => document.getElementById('infopanel');

// Show an element
const show = (elem) => {
  elem.classList.add('is-visible');
};

// Hide an element
const hide = (elem) => {
  elem.classList.remove('is-visible');
};

// Toggle element visibility
const toggle = (elem) => {
  elem.classList.toggle('is-visible');
};


/*
function uikDataLoad() {
  // загрузка данных по полигону
  let UikData;
  return fetch('/json/uik.json', {
    headers: {
      'Cache-Control': 'no-cache'
    },
  }).then(res => res.json())
    .then((UikData) => {
      console.log('Загружены данные', UikData);
      // обработка
      UikData.values.forEach((data) => {
        myData.uik.push(data);
      });
    })
    .catch(console.warn);
}
*/


// ShowModal geo decode
function myShowModalGeo() {
  document.getElementById('myDialog').showModal();
}

function myProccessCoord() {
  let gText = document.getElementById('fgeocoordtext').value;
  try {
    let res = eval(gText);
    res = (ymaps.geometry.LineString.toEncodedCoordinates(new ymaps.geometry.LineString(res)));
    document.getElementById('fgeocoordtext').value = res;
  } catch (e) {
    alert('Ошибка: ' + e.message + ', повторите ввод');
  }
}

function mapPolygonLoad() {
  // загрузка данных по полигону
  // let CountyData;
  return fetch('/CountyData.json').then(res => res.json())
    .then((CountyData) => {
      console.log('Загружены данные', CountyData);
      // обработка
      let count = CountyData.features.length - 1;
      let i = 0;
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
      const currentCountyIndex = Math.floor((Math.random() * (countCounty - 1)) + 1);
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
  const filtUik = myData.uik.filter(k => k[0] === objNum);

  const htmlInfo = filtUik.map((currentValue, index, array) => {
    return currentValue.map((currentValue2, index2, array2) => {
      return index2 > 1 ? currentValue2 : '';
    }).join('\n');
  }).join('\n---\n');
  // htmlInfo = filtUik.reduce(reducer);
  // console.log('mapShowInfo',filtUik,htmlInfo);
  const str = `Информация об объекте: ${objNum} <br> <pre>${htmlInfo}</pre>`;
  document.getElementById('mapInfo').innerHTML = str;
}


function mapSetClick() {
  myMap.geoObjects.events.add(
    'click', (e) => {
      const thisPolygon = e.get('target');
      const objNum = thisPolygon.properties.get('number');
      console.log('click on geo prop_number: ', objNum);
      mapShowInfoObjNum(objNum);
    });
}




function fUpdate() {
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
  const REGEX = /\*/y;
  // document.getElementById('resBody').innerHTML="";
  fetch('./json/table.json', {
    headers: {
      'Cache-Control': 'no-cache',
    },
  })
    .then((response) => {
      if (response.status !== 200) {
        console.log(`Looks like there was a problem. Status Code: ${response.status}`);
        return;
      }
      let sRows = '<tr>';
      // Examine the text in the response

      response.json().then((data) => {
        for (const row of data.values) {
          for (const value of row) {
            sRows += REGEX.test(value) ? `<td class="red">${formatNum(value)}</td>` : `<td>${formatNum(value)}</td>`;
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
  document.getElementById('cresTableFill').onclick = (() => {
    resTableFill();
  });
  document.getElementById('cUpdate').onclick = (() => {
    fUpdate();
  });
}


let objs = [];

// - универсальна процедура для загрузки маркеров на карту
function addMarkersUniv(pMode) {
// ansambl
//  0    1    2                           3                      4        5        6        7            8
// 432	СР	МАОУ «Средняя общеобразоват	"Мобильная библиотека 	3473	57.981029	56.293026	#c1c0bc	islands#blueBookCircleIcon'
// 0 - "number", 1 - "district", 2 - "Type", 3 - "Name", 4 - "Description", 5 - "iconcaption", 6 - "latitude", 7 - "longitude", 8 - "color", 9 - "icon"
  const filterValue = document.getElementById('tFilter').value;
  const reFilter = new RegExp(filterValue, 'i');
  const filterLen = filterValue.length;

  document.getElementById('modeCapt').innerHTML = `Режим ${pMode} (${(filterLen >= 2) ? filterValue : '-'})`;

  objs = [];

  fetch('./json/objects.json', { headers: { 'Cache-Control': 'no-cache' } })
    .then((response) => {
      if (response.status !== 200) {
        console.log(`addMarkers ${pMode} Looks like there was a problem. Status Code: ${response.status}`);
        return;
      }
      // Examine the text in the response
      response.json().then((data) => {
        // console.log(data);
        data.values.forEach((item, index, array) => {
          // console.log(item, index);
          let marker;
          let geometry;
          if (item[2] === pMode && (filterLen < 2 || (filterLen >= 2 && reFilter.test(item.join(' '))))) {
            switch (item[6]) {
              case 'LineString':
                geometry = ymaps.geometry.LineString.fromEncodedCoordinates(item[7]);
                marker = new ymaps.Polyline(
                  geometry,
                  {
                    hintContent: `${item[0]} ${item[1]} ${item[2]}s`,
                    balloonContent: `${item[0]} ${item[1]} ${item[2]} <br> ${item[3]} <br> ${item[4]} <br> ${item[5]} `,
                    number: item[0],
                  }, {
                    draggable: false,
                    strokeColor: '#FF0000',
                    strokeWidth: 4,
                    // Первой цифрой задаем длину штриха. Второй — длину разрыва.
                    strokeStyle: 'solid',
                  }
                );
                break;
              default:
                marker = new ymaps.Placemark([item[6], item[7]], {
                  balloonContent: `${item[0]} ${item[1]} ${item[2]} <br> ${item[3]} <br> ${item[4]} <br> ${item[5]} `,
                  number: item[0],
                }, {
                  preset: (typeof item[9] === 'undefined') ? 'islands#blueCircusCircleIcon' : item[9],
                  iconColor: item[8],
                });
                break;
            }

            objs.push(marker);
            // console.log(marker);
            myMap.geoObjects.add(marker);
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

function mapUNIV() {
  mapClearAll();
  mapPolygonLoad();
  addMarkersUniv(myData.mode);
}


function filterSetClick() {
  const input = document.getElementById('tFilter');
  input.addEventListener('keyup', (event) => {
    event.preventDefault();
    if (event.keyCode === 13) {
      console.log('Filter enter click');
      mapUNIV();
    }
  });
}

function timerUpdate() {
  setInterval(() => {
    console.log('timerUpdate.Update start');
    fUpdate().then((a) => {
      console.log('timerUpdate stop - after File update - resTablefill', a);
      resTableFill();
    });
  }, 60000);
}

function mapAddList(pmyMap) {
  // обновить
  const secondButton = new ymaps.control.Button({
    data: {
      // Зададим иконку для кнопки.
      // image: 'images/button.jpg',
      // Текст на кнопке.
      content: 'Кубы в ленинском районе',
      // Текст всплывающей подсказки.
      title: 'Нажмите что бы отфильтровать',
    },
    options: {
      // Зададим опции кнопки.
      selectOnClick: false,
      // У кнопки будет три состояния: иконка, текст и текст + иконка.
      // Зададим три значения ширины кнопки для всех состояний.
      maxWidth: [30, 100, 150],
    }
  });

  secondButton.events.add('click', () => {
    document.getElementById('tFilter').value = 'ЛР.+КУБ';
    myData.mode = 'Пикет';
    mapUNIV();
  });

  pmyMap.controls.add(secondButton, {
    float: 'right',
  });

  // Создадим собственный макет выпадающего списка.
  const modeList = new ymaps.control.ListBox({
    data: {
      content: 'Данные',
      title: 'Данные, которые будут отражены на карте'
    },
    items: [
      new ymaps.control.ListBoxItem({
        data: {
          content: 'ТИК',
          mode: 11,
        },
        options: {
          selectOnClick: false,
        },
      }),
      new ymaps.control.ListBoxItem({
        data: {
          content: 'Шествия',
          mode: 12,
        },
        options: {
          selectOnClick: false,
        },
      }),
      new ymaps.control.ListBoxItem({
        data: {
          content: 'Пикет',
          mode: 13,
        },
        options: {
          selectOnClick: false,
        },
      }),
      new ymaps.control.ListBoxItem({
        options: {
          type: 'separator',
        },
      }),
      new ymaps.control.ListBoxItem({
        data: {
          content: 'Районы',
          mode: 20,
        },
        options: {
          selectOnClick: false,
        },
      }),
    ],
  });

  modeList.events.add('click', (e) => {
    // Получаем ссылку на объект, по которому кликнули.
    // События элементов списка пропагируются
    // и их можно слушать на родительском элементе.
    const item = e.get('target');
    // Клик на заголовке выпадающего списка обрабатывать не надо.
    if (item != modeList) {
      console.log('Menu click - set mode ', item.data.get('mode'), item.data.get('content'));
      switch (item.data.get('mode')) {
        /* case 1:
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
          break; */
        case 11:
          myData.mode = 'ТИК';
          mapUNIV();
          break;
        case 12:
          myData.mode = 'Шествия';
          mapUNIV();
          break;
        case 13:
          myData.mode = 'Пикет';
          mapUNIV();
          break;
        default:
          myData.mode = 'Пикет';
          mapUNIV();
          break;
      }
    }
  });

  myMap.controls.add(modeList, {
    float: 'left',
  });
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
      if (myMap.getZoom() === 10) {
        myMap.setZoom(11);
      }
    }
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
      ); */

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

  // спрятать таблицы с информацией
  // hide(eInfopanel());

  // Меню для выбора режима карты
  mapAddList(myMap);

  // Загрузить полигоны районов
  mapPolygonLoad();
  // Загрузить данные по адресам/уикам
  // uikDataLoad();
  // навесить обработчики + *
  addCupdate();
  // отобразить УИК
  // addMarkersUIK();
  // заполнить таблицу
  resTableFill();
  // навесить обработчики на карту
  mapSetClick();
  // навесить обработку на фильтр
  filterSetClick();
  // Запустить обновление таблицы по таймеру 1раз в 60 секунд
  // timerUpdate()
}

ymaps.ready(init);

