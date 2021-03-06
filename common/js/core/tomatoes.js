var Tomatoes = (function() {
/*
    BaseController.prototype.init = function(appBridge) {  };
    BaseController.prototype.enable = function() {  }; // private use in setOptions
    BaseController.prototype.disable = function() {  }; // private use in setOptions
    BaseController.prototype.setOptions = function(params) { };
*/

    var tomatoes = {

        url: 'http://tomato.es',

        urlPrefix: 'tomatoes/',
        urlPrefixCombo: 'tomatoes-combo/',
        pomodore: undefined,

        appBridge: undefined,
        overTimeCounter: 0,

        overTimePenalty:true,
        normalObj: {
            "attribute": "int",
            "id": "tomatoes",
            "down": true,
            "up": true,
            "type": "habit",
            "text": ":tomato: (Pomodoro)",
            "priority": 1
        },
        comboObj: {
            "attribute": "int",
            "id": "tomatoes-combo",
            "down": false,
            "up": true,
            "type": "habit",
            "text": "C-C-C-COMBO :tomato::tomato::tomato::tomato: (Pomodoro)",
            "priority": 2
        },

        init: function(appBridge) {

            this.appBridge = appBridge;
            this.pomodore = new utilies.Pomodore('tomatoes.pom', appBridge);

        },

        enable:function() {
            this.appBridge.addListener('tomatoes.reset', this.resetHandler);
            this.appBridge.addListener('tomatoes.started', this.startedFromPageHandler);
            this.appBridge.addListener('tomatoes.stopped', this.stoppedFromPageHandler);
            this.appBridge.addListener('tomatoes.pom.started', this.startedHandler);
            this.appBridge.addListener('tomatoes.pom.overTime', this.overTimeHandler);
            tomatoes.appBridge.trigger('controller.addTask', {
                urlSuffix: tomatoes.urlPrefix,
                object: tomatoes.normalObj,
                message: 'Task Tomatoes Added'
            });
            tomatoes.appBridge.trigger('controller.addTask', {
                urlSuffix: tomatoes.urlPrefixCombo,
                object: tomatoes.comboObj,
                message: 'Task Tomatoes Combo Added'
            });
        },

        disable: function() {
            this.appBridge.removeListener('tomatoes.reset', this.resetHandler);
            this.appBridge.removeListener('tomatoes.started', this.startedFromPageHandler);
            this.appBridge.removeListener('tomatoes.stopped', this.stoppedFromPageHandler);
            this.appBridge.removeListener('tomatoes.pom.started', this.startedHandler);
            this.appBridge.removeListener('tomatoes.pom.overTime', this.overTimeHandler);
        },

        setOptions: function(params) {

            if (params.tomatoesIsActive) {
                if (params.tomatoesIsActive == 'true')
                    this.enable();
                else
                    this.disable();
            }

            this.overTimePenalty = params.tomatoesOverTimePenalty == 'true' ? true : false;
        },

        setValue: function(params, name) {
            if (params[name]) this[name] = params[name];
        },

        resetHandler: function() {
            tomatoes.pomodore.stop(true);
            tomatoes.overTimeCounter= 0;
        },

        startedFromPageHandler: function(data) {
            tomatoes.pomodore.workCount = data.tomatoCount;
            tomatoes.pomodore.start();
            tomatoes.overTimeCounter= 0;
        },

        stoppedFromPageHandler: function() {
            tomatoes.pomodore.stop();
            tomatoes.appBridge.trigger('controller.sendRequest', {
                urlSuffix: tomatoes.urlPrefix+'down',
                message: 'You broke the flow!! {score} HP...'
                });
        },

        startedHandler: function(data) {
            if (data.type == 'break')
                tomatoes.appBridge.trigger('controller.sendRequest', {
                    urlSuffix: tomatoes.urlPrefix+'up',
                    message: 'You made your '+(data.tomatoCount+1)+' tomato! Well done {score} Exp/Gold!'
                });
            else if (data.type == 'break.big')
                tomatoes.appBridge.trigger('controller.sendRequest', {
                    urlSuffix: tomatoes.urlPrefixCombo+'up',
                    message: 'You made your '+((data.tomatoCount)/4)+' C-C-C-COMBO tomato! GREAT ! You gain {score} Exp/Gold!'
                });
        },

        overTimeHandler: function(data) {

            if (!tomatoes.overTimePenalty) return;

            var message = 'You are over '+(data.type == 'work' ? 'working' : 'breaking');
            if (tomatoes.overTimeCounter % 2 == 1)
                tomatoes.appBridge.trigger('app.notify', {
                        message: message+'! Next time you will lose HP!'
                    });
            else
                tomatoes.appBridge.trigger('controller.sendRequest', {
                    urlSuffix: tomatoes.urlPrefix+'down',
                    message: message+' {score} HP!!'
                });


            tomatoes.overTimeCounter++;
        }
    };


    return {
        get: function() { return tomatoes; },
        isEnabled: function() { return tomatoes.appBridge.hasListener('tomatoes.started', tomatoes.startedFromPageHandler); },
        init: function(appBridge) { tomatoes.init(appBridge); },
        setOptions: function(params) { tomatoes.setOptions(params); }
    };

})();
