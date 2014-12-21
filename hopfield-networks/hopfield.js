// Generated by CoffeeScript 1.8.0
(function() {
  var color, deep_copy, force, get_input, height, link, links, make_d3_links, node, node_group, nodes, nodes_orig, random_nodes, random_weights, recall, redraw_nodes, svg, text, weights, width;

  random_nodes = function(N) {
    var i, node, nodes, value, values;
    if (N == null) {
      N = 6;
    }
    values = (function() {
      var _i, _results;
      _results = [];
      for (node = _i = 0; 0 <= N ? _i <= N : _i >= N; node = 0 <= N ? ++_i : --_i) {
        _results.push(Math.round(Math.random()));
      }
      return _results;
    })();
    return nodes = (function() {
      var _i, _len, _results;
      _results = [];
      for (i = _i = 0, _len = values.length; _i < _len; i = ++_i) {
        value = values[i];
        _results.push({
          "index": i,
          "state": value
        });
      }
      return _results;
    })();
  };

  random_weights = function(N, size) {
    var i, j, weights;
    if (size == null) {
      size = 3;
    }
    return weights = (function() {
      var _i, _results;
      _results = [];
      for (i = _i = 0; 0 <= N ? _i < N : _i > N; i = 0 <= N ? ++_i : --_i) {
        _results.push((function() {
          var _j, _results1;
          _results1 = [];
          for (j = _j = 0; 0 <= N ? _j < N : _j > N; j = 0 <= N ? ++_j : --_j) {
            if (i === j) {
              _results1.push(0);
            } else {
              _results1.push(Math.round(Math.random() * size * 2 - size));
            }
          }
          return _results1;
        })());
      }
      return _results;
    })();
  };

  deep_copy = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  get_input = function(nodes, weights, i) {
    var sum, weight, weights_in, _i, _len;
    weights_in = weights[i];
    sum = 0;
    for (i = _i = 0, _len = weights_in.length; _i < _len; i = ++_i) {
      weight = weights_in[i];
      sum += weight * nodes[i].state;
    }
    return sum;
  };

  recall = function(nodes, weights, callback) {
    var i, new_state, no_change, node_idxs, node_in, node_state, num_no_change, _i, _j, _len, _ref, _ref1, _results;
    if (callback == null) {
      callback = null;
    }
    node_idxs = (function() {
      _results = [];
      for (var _i = 0, _ref = nodes.length; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this);
    num_no_change = 0;
    while (num_no_change < 10) {
      no_change = true;
      _ref1 = _.shuffle(node_idxs);
      for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
        i = _ref1[_j];
        node_state = nodes[i].state;
        node_in = get_input(nodes, weights, i);
        new_state = node_in >= 0 ? 1 : 0;
        if (new_state !== nodes[i].state) {
          no_change = false;
        }
        nodes[i].state = new_state;
        if (callback != null) {
          callback(deep_copy(nodes));
        }
      }
      if (no_change) {
        num_no_change += 1;
      }
    }
    return nodes;
  };

  make_d3_links = function(nodes, weights) {
    var links, prev;
    links = [];
    prev = null;
    weights.forEach(function(row, i) {
      return row.forEach(function(weight, j) {
        if (i !== j) {
          return links.push({
            "source": i,
            "target": j,
            "weight": weight
          });
        }
      });
    });
    return links;
  };

  nodes_orig = random_nodes();

  nodes = deep_copy(nodes_orig);

  weights = random_weights(nodes.length);

  links = make_d3_links(nodes, weights);

  width = 960;

  height = 500;

  force = d3.layout.force().size([width, height]);

  svg = d3.select("body").append("svg").attr("width", width).attr("height", height);

  color = d3.scale.category10();

  force.nodes(nodes).links(links).linkDistance(300).friction(0.001).start();

  link = svg.selectAll(".link").data(links).enter().append("line").attr("class", "link").style("stroke-width", function(d) {
    return Math.abs(d.weight);
  });

  node_group = svg.selectAll("g").data(nodes).enter().append("g").call(force.drag);

  node = node_group.append("circle").attr("class", "node").attr("r", 12).attr("cx", 6).attr("cy", 6).attr("fill", "white");

  text = node_group.append("text").text(function(d) {
    return d.state;
  }).attr("text-anchor", "middle").attr("alignment-baseline", "center").attr("dominant-baseline", "middle").attr("x", 6).attr("y", 7);

  force.on("tick", function() {
    link.attr("x1", function(d) {
      return d.source.x;
    });
    link.attr("y1", function(d) {
      return d.source.y;
    });
    link.attr("x2", function(d) {
      return d.target.x;
    });
    link.attr("y2", function(d) {
      return d.target.y;
    });
    return node_group.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  });

  redraw_nodes = function(nodes) {
    return svg.selectAll("g").data(nodes).selectAll("text").text(function(d) {
      return d.state;
    });
  };

  setTimeout((function() {
    return recall(nodes, weights, redraw_nodes);
  }), 1500);

}).call(this);