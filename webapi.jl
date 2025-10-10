include("forest.jl")
using Genie, Genie.Renderer.Json, Genie.Requests, HTTP
using UUIDs

instances = Dict() #Diccionario para las instancias.

route("/simulations", method = POST) do
    payload = jsonpayload()
    x = payload["dim"][1]
    y = payload["dim"][2]

    model = forest_fire(griddims=(x,y), density=density, probability_of_spread=probability)
    id = string(uuid1()) #Le da un ID
    instances[id] = model #Lo guarda en el diccionario

    trees = [] #Lista de todos los árboles,
    for tree in allagents(model)
        push!(trees, tree)
    end
    
    json(Dict(:msg => "Hola", "Location" => "/simulations/$id", "trees" => trees)) #Nos da los datos de los árboles.
end

route("/simulations/:id") do
    model = instances[payload(:id)] #Obtiene el modelo del ID
    run!(model, 1)
    trees = [] #Sacamos la info de los árboles.
    for tree in allagents(model)
        push!(trees, tree)
    end
    
    json(Dict(:msg => "Adios", "trees" => trees))
end

Genie.config.run_as_server = true
Genie.config.cors_headers["Access-Control-Allow-Origin"] = "*"
Genie.config.cors_headers["Access-Control-Allow-Headers"] = "Content-Type"
Genie.config.cors_headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS" 
Genie.config.cors_allowed_origins = ["*"]

up()