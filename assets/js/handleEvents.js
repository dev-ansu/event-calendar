const formAddEvent = document.getElementById("form-add-event");
const days = 'seg,ter,qua,qui,sex,sab,dom'.split(",")
let btnsExcluirEventos;
const searchEvent = document.getElementById("search-event");
const filterDate = document.getElementById("filter-date");

const getEvents = (filter = null)=>{
    const events = JSON.parse(localStorage.getItem("events"));

    if(filter != null){
        return events.filter(el =>{
            if(el.evento.normalize("NFD").includes(filter.normalize("NFD")) || el.inicio == filter || el.termino == filter){
                return el;
            }
        })
    }

    return events;
}

const setLocaleStorage = (items)=>{
    localStorage.setItem('events', JSON.stringify(items));
}

const save = (data)=>{
    const events = getEvents();
    const id = events && events.length ? events.length+ 1:1;
    data.id = id;
    if(events){
        const newEvents = [...events, data]
        setLocaleStorage(newEvents);
    }else{
        setLocaleStorage([data]);
    }
    return 1;
}

const remove = (id)=>{
    const events = getEvents();

    const newEvents = events.filter((event) =>{
        return event.id != parseInt(id);
    });
    setLocaleStorage(newEvents);
    showEvents();

}

const addEvent = (e)=>{
   e.preventDefault();
   let data = {evento: null, inicio:null, termino:null};
   Array.from(e.target.querySelectorAll("input")).forEach( el =>{
        if(el.value.trim()){
            data = {...data, [el.name]: el.value}
        }
   });
   if(data.evento && data.inicio && data.termino){
        save(data);
   }else{
    alert("Todos os campos são obrigatórios.")
    }
   showEvents();
}

const agruparEventosPorMes = (eventos)=>{
    const months = 'janeiro,fevereiro,março,abril,maio,junho,julho,agosto,setembro,outubro,novembro,dezembro'.split(',');

    const res = eventos.reduce((acc, evento)=>{

        const mes = months[new Date(`${evento.inicio}T00:00:00`).getMonth()];
        const ano = new Date(`${evento.inicio}T00:00:00`).getFullYear();
        const chave = `${String(mes)}-${String(ano)}`

        if(!acc[chave]){
            acc[chave] = [];
        }
        
        acc[chave].push(evento);
        return acc;
    }, {});

    return res;
}


const showEvents = (filter = null)=>{

    const allEvents = agruparEventosPorMes(getEvents(filter));
    const eventsContainer = document.getElementById("events")
    eventsContainer.innerHTML = '';

    let html;
    for(let event in allEvents){
        const title = event.split("-").join(" | ");
        html = `
            <div class="card">
            <div class="card-header">
                <h5>${title}</h5>
            </div>
            <div class="card-body">
        `
        allEvents[event].forEach(value => {
            const day = new Date(value.inicio).getDate();
            const dayName = days[new Date(value.inicio).getDay()];
            const inicio = new Date(`${value.inicio}T00:00:00`).toLocaleDateString('pt-br')
            const termino = new Date(`${value.termino}T00:00:00`).toLocaleDateString('pt-br')
            
            html+= `
            <div class="card my-1">
                <div class="card-body d-flex gap-3">
                        <div class="d-flex flex-column justify-content-end align-items-end">
                            <span>${day}</span>
                            <span>${dayName.toUpperCase()}</span>
                        </div>
                        <div class="d-flex gap-1 w-100">
                            <div class="d-flex w-100 flex-column">
                                <span>${value.evento}</span>
                                <span>${inicio} até ${termino}</span>
                            </div>
                            <button id="${value.id}" class="btn btn-excluir-evento btn-sm fs-6">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
    
            `
        });
        html +="</div>"
        html += "</div>"
        eventsContainer.innerHTML += html; 

    }
    btnsExcluirEventos = document.querySelectorAll(".btn-excluir-evento")
    btnsExcluirEventos.forEach(btn =>{
        btn.addEventListener("click", (e)=>{
            e.preventDefault();
            remove(e.currentTarget.id)
        })
    });
}

formAddEvent.addEventListener("submit", addEvent)

document.addEventListener("DOMContentLoaded", ()=>{
    showEvents();
});

searchEvent.addEventListener("input", (e)=>{
    showEvents(e.target.value);
})


filterDate.addEventListener("change", (e)=>{
    showEvents(e.target.value)
})