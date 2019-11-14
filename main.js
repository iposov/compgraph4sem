function init() {
  console.info("initialized"); //console.log,info,error,warn,debug

  var canvas = document.getElementById("game");

  //Stage - это контейнер для всех DisplayObject
  var stage = new createjs.Stage(canvas);

  //сначала добавим на сцену Shape
  var shape = new createjs.Shape();
  //рисовать на Shape можно как на Canvas
  //graphics - это аналог контекста, рисовать надо
  //на нем
  shape.graphics
      .beginFill('#FF00FF')
      .rect(-10, -10, 20, 20);
  shape.x = 100;
  shape.y = 100;
  shape.rotation = 30;

  //добавить shape на сцену
  stage.addChild(shape);

  //добавим еще спрайт на сцену
  //SpriteSheet - рисунок с кадрами
  var ss = new createjs.SpriteSheet({
    images: ["balls-boom.png"], //16 на 34 кадра
    frames: {
      width: 16,
      height: 16, //высота и ширина кадра
      count: 544,
      regX: 8, //pivot точка
      regY: 8
    },
    animations: { //список анимаций
      //названия придумаем сами
      one: 42, //один кадр номер 42
      small: [0, 33, "small"], //с 0 до 33 кадра,
                               //а потом опять small
      big: [0, 543 - 34, "big"],
      boom : [544 - 34, 543] //последняя строка
    }
  });
  var sprite = new createjs.Sprite(ss);
  sprite.x = 200;
  sprite.y = 200;
  sprite.gotoAndPlay("big");
  stage.addChild(sprite);

  stage.update(); //это команда на рисование сцены

  //либо давайте запустим таймер, который будет постоянно
  //перерисовывать сцену
  createjs.Ticker.framerate = 30; // кадров/сек
  createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
  // createjs.Ticker.timingMode = createjs.Ticker.RAF;
  // createjs.Ticker.timingMode = createjs.Ticker.TIMEOUT;

  //метод on = addEventListener
  //добавить слушателя, что делать, когда сработал
  //таймер.
  //Особый случай. Если сцена указана как слушатель.
  //Тогда каждый раз вызывается stage.update()
  //createjs.Ticker.on("tick", stage);

  createjs.Ticker.on("tick", tick);

  function tick() {
    //теперь это тело игрового цикла

    //это обновление данных, перемещаем шарик по сцене
    sprite.x += 1;
    if (sprite.x > 300)
      sprite.x = 10;

    //это перерисовка
    stage.update();
  }

  //добавим слушателя, который реагирует на нажатие
  //по шарику
  sprite.on("click", boomClick);

  function boomClick() {
    sprite.gotoAndPlay("boom");
    console.log("boom");
    sprite.on("animationend", function() {
      console.log("boom finished");
      //уберем со сцены, объект больше
      //не будет рисоваться
      stage.removeChild(sprite);
    });
  }

  //Добавим на сцену контейнер с треугольником
  //и квадратом внутри.

  var container = new createjs.Container();
  var triag = new createjs.Shape();
  var sq = new createjs.Shape();
  //метод addChild аналогичем методу Stage.addChild,
  //потому что сцена - тоже контейнер.
  container.addChild(triag);
  container.addChild(sq);
  stage.addChild(container);

  triag.graphics
      .beginFill('green')
      .moveTo(0, 0)
      .lineTo(40, 0)
      .lineTo(20, 20)
      .endFill();
  sq.graphics
      .beginFill('red')
      .rect(0, 0, 30, 30);
  triag.x = 20;
  container.x = 100;
  container.y = 240;

  stage.aaa = 'stage';
  sq.aaa = 'sq';
  triag.aaa = 'triag';
  container.aaa = 'container';

  //on = addEventListener + доп полезные аргументы
  stage.on("click", function(e) {
    console.log('stage click', showEvent(e));
  });
  container.on("click", function(e) {
    console.log('container click', showEvent(e));
  });
  sq.on("click", function(e) {
    console.log('sq click', showEvent(e));
  });
  triag.on("click", function(e) {
    console.log('triag click', showEvent(e));
  });

  function showEvent(e) {
    return {
      localX: e.localX,
      localY: e.localY,
      stageX: e.stageX,
      stageY: e.stageY,
      target: e.target.aaa,
      currentTarget: e.currentTarget.aaa
    }
  }

  //click срабатывает при нажатии на "нарисованный"
  //пиксель.
  //события срабатывают в порядке "всплывания" к
  //вершине списка отображения (к сцене)
  //
  //информация о событии e содержит:
  //  - координаты нажатия stageX, stageY на сцене
  //  - координаты нажатия в системе координат
  //     объекта localX, localY
  //  - target, currentTarget - объект, на котором
  //    произошло событие. target - всегда
  //  красный квадрат. currentTarget - квадрат, контейнер,
  //  сцена.
  //другие данные внутри e: см. Документация MouseEvent

  //продемонстрируем фазу захвата и то, что один
  //слушатель может висеть на разных объектах
  function clickListener(e) {
    console.log('click', showEvent(e));
  }
  //true в конце означает, что мы просим capture фазу
  stage.addEventListener('click', clickListener, true);
  sq.addEventListener('click', clickListener, true);
  triag.addEventListener('click', clickListener, true);
  container.addEventListener('click', clickListener, true);

  //события о движении мыши необходимо явно
  //включить. Можно указать частоту проверки.
  stage.enableMouseOver();
  //два события "навели мышь"
  container.on("rollover", function() {
    console.log("container rollover");
  });
  container.on("mouseover", function() {
    console.log("container mouseover");
  });
  //два события "убрали мышь"
  container.on("rollout", function() {
    console.log("container rollout");
  });
  container.on("mouseout", function() {
    console.log("container mouseout");
  });
  //события mouseover/mouseout всплывают из квадрата
  //и треугольника, поэтому при переходе между квадра
  //том и треугольником мы получаем эти события на
  //контейнере. Хотя фактически мы из контейнера мышь
  //не уводили. Более удобные события rollover, rollout,
  //они сработают только при реальном входе и выходе
  //из контейнера.

  /* TweenJS
  Параметрическая анимация. Т.е. мы меняем параметры
  объектов, например, их координаты, цвета, с течением
  времени по определенному закону.
   */
  var square = new createjs.Shape();
  square.graphics
      .beginFill('navy')
      .rect(0, 0, 50, 50);
  stage.addChild(square);

  //get создает tween.
  //указываем сначала, у какого объекта будут
  //изменяться параметры. Второй аргумент -
  //объект с настройками. Например, loop: true,
  //т.е. анимация зациклится
  createjs.Tween.get(square, {})
      //какие установить значения параметрам,
      //и сколько на это отведено времени
      .to({x : 400}, 1000)
      //что изменить после этого
      .to({y: 200}, 2000) //измени y до 200
      .wait(500) //подождать 500 миллисекунд
      .call(function () { //вызови какой-то код
        console.log('here')
      })
      .to({x: 0, alpha: 0.5}, 3000,
          createjs.Ease.elasticInOut);
          //Ease - набор стандартных
          //функций изинга


}