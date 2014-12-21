
# Generate random values (0 or 1) for a random number of nodes.
random_nodes = (N=6) ->
        values = (Math.round(Math.random()) for node in [0..N])
        nodes = ({"index": i, "state": value} for value, i in values)


# Generate random weight matrix for the given number of nodes.
random_weights = (N, size=3) ->
        # We need to make N^2 weights
        weights =
          (for i in [0...N]
               for j in [0...N]
                   if i == j
                       0
                   else
                       Math.round(Math.random() * size * 2 - size))


# TODO hacky
deep_copy = (obj) -> JSON.parse(JSON.stringify(obj))


# Get excitation of given node
get_input = (nodes, weights, i) ->
        weights_in = weights[i]
        sum = 0
        for weight, i in weights_in
            sum += weight * nodes[i].state
        return sum


# Initiate recall
recall = (nodes, weights, callback=null) ->
        # List node indices
        node_idxs = [0...nodes.length]

        num_no_change = 0
        while num_no_change < 10
            no_change = true

            # Shuffle nodes in place (random visit)
            for i in _.shuffle(node_idxs)
               node_state = nodes[i].state
               node_in = get_input(nodes, weights, i)

               new_state = if node_in >= 0 then 1 else 0
               if new_state != nodes[i].state
                   no_change = false
               nodes[i].state = new_state

               if callback?
                   callback(deep_copy(nodes))

            if no_change
                num_no_change += 1

        return nodes


# Generate D3 link data from the given network weights
make_d3_links = (nodes, weights) ->
        links = []
        prev = null
        weights.forEach (row, i) ->
            row.forEach (weight, j) ->
                if i != j
                    links.push {"source": i, "target": j, "weight": weight}

        return links


nodes_orig = random_nodes()
nodes = deep_copy(nodes_orig)
weights = random_weights(nodes.length)
links = make_d3_links(nodes, weights)

width = 960
height = 500

force = d3.layout.force().size([width, height])

svg = d3.select("body").append("svg").attr("width", width).attr("height", height)
color = d3.scale.category10()

# Draw graph
force.nodes(nodes).links(links)
  .linkDistance(300).friction(0.001)
  .start()

link = svg.selectAll(".link").data(links)
  .enter().append("line")
    .attr("class", "link")
    .style("stroke-width", (d) -> Math.abs(d.weight))
    # .style("stroke", (d) -> color(d.weight < 0))

node_group = svg.selectAll("g").data(nodes)
  .enter().append("g")
    .call(force.drag)

node = node_group.append("circle")
  .attr("class", "node")
  .attr("r", 12)
  .attr("cx", 6)
  .attr("cy", 6)
  .attr("fill", "white")

text = node_group.append("text")
  .text((d) -> d.state)
  .attr("text-anchor", "middle")
  .attr("alignment-baseline", "center")
  .attr("dominant-baseline", "middle")
  .attr("x", 6)
  .attr("y", 7)

force.on "tick", ->
        link.attr "x1", (d) -> d.source.x
        link.attr "y1", (d) -> d.source.y
        link.attr "x2", (d) -> d.target.x
        link.attr "y2", (d) -> d.target.y

        node_group.attr "transform", (d) -> "translate(#{d.x},#{d.y})"

# Update node states in display
redraw_nodes = (nodes) ->
    svg.selectAll("g").data(nodes)
      .selectAll("text").text((d) -> d.state)


setTimeout((-> recall(nodes, weights, redraw_nodes)), 1500)
