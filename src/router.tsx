import {BrowserRouter, Routes, Route} from 'react-router-dom'


function Router() {
    return (
        <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<div>Home Page</div>} />
            </Routes>
        </BrowserRouter>
        </>
    )
}

export default Router