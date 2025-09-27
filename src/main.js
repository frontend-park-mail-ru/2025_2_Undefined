import { Signup } from "./pages/signup/signup"

const root = document.getElementById('root');
const signup = new Signup(root);
function renderSignup(){
    signup.render();
}
renderSignup();