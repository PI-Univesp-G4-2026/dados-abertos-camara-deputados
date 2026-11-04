import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ListaDeputados from './pages/ListaDeputados'
import FichaDeputado from './pages/FichaDeputado'
import DashboardPartidos from './pages/DashboardPartidos'

export default function App() {
  return (
      <BrowserRouter>
        <a href="#conteudo" className="skip-link">Ir para o conteúdo</a>
        <div id="conteudo">
          <Routes>
            <Route path="/" element={<ListaDeputados />} />
            <Route path="/deputados/:id" element={<FichaDeputado />} />
            <Route path="/partidos" element={<DashboardPartidos />} />
          </Routes>
        </div>
      </BrowserRouter>
  )
}