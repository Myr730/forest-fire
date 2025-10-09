using Agents, Random, Distributions

@enum TreeStatus green burning burnt

@agent struct TreeAgent(GridAgent{2})
    status::TreeStatus = green #Todos empiezan como árboles normales.
end

#Esta función checa el estado del árbol: "verde" (normal), "quemándose" o "quemado".
function forest_step(tree::TreeAgent, model)
    if tree.status == burning #Se revisa si el árbol está "quemándose"
        for neighbor in nearby_agents(tree, model) #Si sí, checa a sus vecinos.
            if neighbor.status == green
                neighbor.status = burning #Cada vecino "verde" se cambia a estátus de "quemándose".
            end
        end
        tree.status = burnt #Y el que se estaba quemando pasa a "quemado"
    end
end

function forest_fire(; density = 0.70, griddims = (5, 5))
    space = GridSpaceSingle(griddims; periodic = false, metric = :manhattan)
    forest = StandardABM(TreeAgent, space; agent_step! = forest_step, scheduler = Schedulers.ByID())
    #Checa todas las posiciones del grid.
    for pos in positions(forest)
        if rand(Uniform(0,1)) < density
            tree = add_agent!(pos, TreeAgent, forest)
            if pos[1] == 1 #Los árboles de la primers columna pasan a "quemándose".
                tree.status = burning
            end
        end
    end
    return forest
end
