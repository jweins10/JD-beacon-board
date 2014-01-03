(function() {
  var BeaconTestApplication,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BeaconTestApplication = (function() {

    BeaconTestApplication.prototype.status_api = '/api/status';

    BeaconTestApplication.prototype.connected_board_api = '/api/connected_board';

    BeaconTestApplication.prototype.heartbeat_interval = 500;

    BeaconTestApplication.prototype.possible_colors = ['green', 'none', 'red'];

    function BeaconTestApplication() {
      this.update_complete = __bind(this.update_complete, this);

      this.start_update = __bind(this.start_update, this);

      this._simulation_is_enabled = __bind(this._simulation_is_enabled, this);

      this.opponent_color = __bind(this.opponent_color, this);

      this._simulation_capture_should_be_applied = __bind(this._simulation_capture_should_be_applied, this);

      this.handle_simulation = __bind(this.handle_simulation, this);

      this._disable_simulation_controls = __bind(this._disable_simulation_controls, this);

      this._enable_simulation_controls = __bind(this._enable_simulation_controls, this);

      this._set_simulation_interval = __bind(this._set_simulation_interval, this);

      this.update_simulation_parameters = __bind(this.update_simulation_parameters, this);

      this.ensure_beacon_is_on = __bind(this.ensure_beacon_is_on, this);

      this.apply_beacon_status = __bind(this.apply_beacon_status, this);

      this.apply_board_status = __bind(this.apply_board_status, this);

      this.update_status = __bind(this.update_status, this);

      this.initialize_simulation = __bind(this.initialize_simulation, this);

      this.set_up_simulation_panel = __bind(this.set_up_simulation_panel, this);

      this.set_up_affiliation_panels = __bind(this.set_up_affiliation_panels, this);

      this.set_up_claim_panels = __bind(this.set_up_claim_panels, this);
      this.manual_control_panel = $('#manual_control');
      this.owner_graphic = $('#owner');
      this.claim_panels = {
        red: $('#claim_red'),
        green: $('#claim_green'),
        none: $('#claim_none')
      };
      this.affiliation_panels = {
        red: $('#affiliation_red'),
        green: $('#affiliation_green')
      };
      this.simulation_controls = {
        simulation_enable: $("#simulate_capture"),
        simulation_interval: $("#simulation_interval"),
        probabilistically_capture: $('#probabilistically_capture'),
        capture_probability: $('#capture_probability'),
        probabilistically_capture_label: $("#probabilistically_capture_label")
      };
      this.set_up_claim_panels();
      this.set_up_affiliation_panels();
      this.set_up_simulation_panel();
      this.initialize_simulation();
      this.state = {};
    }

    BeaconTestApplication.prototype.perform_api_call = function(api, argument, handler) {
      var url_suffix;
      if (argument == null) {
        argument = null;
      }
      if (handler == null) {
        handler = null;
      }
      if (typeof argument === "string") {
        url_suffix = "/" + argument;
        argument = null;
      } else {
        url_suffix = "";
      }
      return $.getJSON("/api/" + api + url_suffix, argument, handler);
    };

    BeaconTestApplication.prototype.set_up_claim_panels = function() {
      var _this = this;
      this.claim_panels.red.click(function() {
        return _this.claim_beacon('red');
      });
      this.claim_panels.none.click(function() {
        return _this.claim_beacon('none');
      });
      return this.claim_panels.green.click(function() {
        return _this.claim_beacon('green');
      });
    };

    BeaconTestApplication.prototype.set_up_affiliation_panels = function() {
      var _this = this;
      this.affiliation_panels.green.click(function() {
        return _this.set_affiliation('green');
      });
      return this.affiliation_panels.red.click(function() {
        return _this.set_affiliation('red');
      });
    };

    BeaconTestApplication.prototype.set_up_simulation_panel = function() {
      var name, object, _ref, _results;
      _ref = this.simulation_controls;
      _results = [];
      for (name in _ref) {
        object = _ref[name];
        _results.push(object.change(this.update_simulation_parameters));
      }
      return _results;
    };

    BeaconTestApplication.prototype.initialize_simulation = function() {
      return this.simulation_interval = null;
    };

    BeaconTestApplication.prototype.run = function() {
      return setInterval(this.update_status, this.heartbeat_interval);
    };

    BeaconTestApplication.prototype.update_status = function() {
      this.perform_api_call('connected_board', null, this.apply_board_status);
      return this.perform_api_call('status', null, this.apply_beacon_status);
    };

    BeaconTestApplication.prototype.apply_board_status = function(status) {
      var location;
      location = status.location ? "Beacon on " + status.location : 'No boards found.';
      return $('#connected_board').html(location);
    };

    BeaconTestApplication.prototype.apply_beacon_status = function(status) {
      if (this.updating) {
        return;
      }
      this.state = status;
      if (status.error != null) {
        this._apply_disconnected_status();
        return;
      }
      this.manual_control_panel.removeClass('disabled');
      this.display_beacon_owner(status.owner);
      return this.display_beacon_affiliation(status.affiliation);
    };

    BeaconTestApplication.prototype.display_beacon_owner = function(owner) {
      this.owner_graphic.attr('class', "beacon activated " + owner);
      return this._set_owner_selection(owner);
    };

    BeaconTestApplication.prototype.display_beacon_affiliation = function(affiliation) {
      return this._set_affiliation_selection(affiliation);
    };

    BeaconTestApplication.prototype._apply_disconnected_status = function() {
      this.manual_control_panel.addClass('disabled');
      return this.owner_graphic.attr('class', "beacon disconnected");
    };

    BeaconTestApplication.prototype._set_selection = function(selected, collection) {
      var i, object;
      if (selected == null) {
        selected = null;
      }
      if (collection == null) {
        collection = this.claim_panels;
      }
      for (i in collection) {
        object = collection[i];
        object.removeClass('selected');
      }
      if (selected) {
        return collection[selected].addClass('selected');
      }
    };

    BeaconTestApplication.prototype._set_owner_selection = function(owner) {
      if (owner == null) {
        owner = null;
      }
      return this._set_selection(owner, this.claim_panels);
    };

    BeaconTestApplication.prototype._set_affiliation_selection = function(affiliation) {
      if (affiliation == null) {
        affiliation = null;
      }
      return this._set_selection(affiliation, this.affiliation_panels);
    };

    BeaconTestApplication.prototype.ensure_beacon_is_on = function() {
      if (!(this.state.id > 0)) {
        return this.perform_api_call('mode', 'on');
      }
    };

    BeaconTestApplication.prototype.claim_beacon = function(owner) {
      this.start_update();
      this.ensure_beacon_is_on();
      this.display_beacon_owner(owner);
      return this.perform_api_call('claim', owner, this.update_complet);
    };

    BeaconTestApplication.prototype.set_affiliation = function(affiliation) {
      return this.perform_api_call('affiliate', affiliation, this.update_complete);
    };

    BeaconTestApplication.prototype.update_simulation_parameters = function() {
      var interval;
      if (this._simulation_is_enabled()) {
        this._enable_simulation_controls();
        interval = this.simulation_controls.simulation_interval.val() * 1000;
      } else {
        this._disable_simulation_controls();
        interval = null;
      }
      return this._set_simulation_interval(interval);
    };

    BeaconTestApplication.prototype._set_simulation_interval = function(interval) {
      console.log("Setting ye interval to " + interval + ", captain!");
      clearInterval(this.simulation_interval);
      if (interval != null) {
        return this.simulation_interval = setInterval(this.handle_simulation, interval);
      }
    };

    BeaconTestApplication.prototype._enable_simulation_controls = function(enable) {
      var label;
      if (enable == null) {
        enable = true;
      }
      this.simulation_controls.probabilistically_capture.prop('disabled', !enable);
      this.simulation_controls.capture_probability.prop('disabled', !enable);
      label = this.simulation_controls.probabilistically_capture_label;
      if (enable) {
        return label.removeClass('disabled');
      } else {
        return label.addClass('disabled');
      }
    };

    BeaconTestApplication.prototype._disable_simulation_controls = function() {
      return this._enable_simulation_controls(false);
    };

    BeaconTestApplication.prototype.handle_simulation = function() {
      if (this._simulation_capture_should_be_applied()) {
        return this.claim_beacon(this.opponent_color());
      }
    };

    BeaconTestApplication.prototype._simulation_capture_should_be_applied = function() {
      var probability;
      if (!this.simulation_controls.simulation_enable.is(':checked')) {
        return true;
      }
      probability = this.simulation_controls.capture_probability.val() / 100;
      return Math.random() <= probability;
    };

    BeaconTestApplication.prototype.opponent_color = function() {
      switch (this.state.affiliation) {
        case 'red':
          return 'green';
        case 'green':
          return 'red';
        default:
          return 'none';
      }
    };

    BeaconTestApplication.prototype._simulation_is_enabled = function() {
      return this.simulation_controls.simulation_enable.is(':checked');
    };

    BeaconTestApplication.prototype.start_update = function() {
      return this.updating = true;
    };

    BeaconTestApplication.prototype.update_complete = function() {
      return this.updating = false;
    };

    return BeaconTestApplication;

  })();

  $(document).ready(function() {
    window.app = new BeaconTestApplication($('#owner'));
    return window.app.run();
  });

}).call(this);