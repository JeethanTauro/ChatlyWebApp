import axios from 'axios'
import Signup from '../Pages/Signup';
const URL = "api";

const api = axios.create({
    baseURL : URL,
    headers : {
        'Content-Type':'application/json'
    },
    withCredentials:true
});


const generateUserColor = () => {
  const colors = [
    "#FF5733", "#33FF57", "#F39C12", "#1ABC9C",
    "#2ECC71", "#3498DB", "#9B59B6", "#16A085",
    "#27AE60", "#2980B9", "#C0392B", "#D35400",
    "#7F8C8D", "#BDC3C7", "#E67E22", "#E84393",
    "#6C5CE7", "#00CEC9", "#FAB1A0", "#55EFC4",
    "#74B9FF", "#A29BFE", "#FF7675", "#FD79A8",
    "#FFEAA7", "#FD9644", "#26DE81", "#2BCBBA",
    "#45AAF2", "#4B7BEC", "#A55EEA", "#D1D8E0",
    "#778CA3", "#F7B731", "#20BF6B", "#0FB9B1",
    "#EB3B5A", "#8854D0", "#FC427B"
  ];

  // pick a random colour
  return colors[Math.floor(Math.random() * colors.length)];
};

const AuthService={
    login : async (username,password) => {
        try{
            const response = await api.post("/auth/login",{
                username,
                password
            });
            const userColor = generateUserColor();
            const userData = {
                ...response.data,
                color : userColor,
                loginTime : new Date().toISOString()
            };
            localStorage.setItem('currentUser', JSON.stringify(userData)); 
            localStorage.setItem('user', JSON.stringify(response.data)); 
            return {
                success : true,
                user : userData
            }
        }
        catch(error){
            console.error("Login failed  :",error);
            const errorMessage = error.response?.data?.message || 'Login failed , PLease check your credentials';
            throw new Error(errorMessage);
        }  
    },

    signup :  async(username, email, password) => {
       try {
      const response = await api.post("/auth/signup", {
        username,
        email,
        password
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Signup failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Signup failed, please try again";
      throw new Error(errorMessage);
    }

    },
    logout : async()=>{
          try{
            await api.post("/auth/logout");

          }
          catch(error){
            console.error(error);
          }
          finally{
             localStorage.removeItem("currentUser");
             localStorage.removeItem("user");
          }     
    },

    fetchCurrentUser : async()=>{
        try{
             const response = await api.get("/auth/getCurrentUser");
             localStorage.setItem('user', JSON.stringify(response.data));
             return response.data;
        }
        catch(error){
            console.error("Fetching user data error : ",error);

            if(error.response && error.response.status === 401){
                await AuthService.logout();
            }
        }
        
    },
    getCurrentUser: ()=>{
        const currentUserStr = localStorage.getItem("currentUser");
        const userStr  = localStorage.getItem('user');

        try{
            if(currentUserStr){
                return JSON.parse(currentUserStr);
            }
            else if(userStr)
            {
                const userData =  JSON.parse(userStr);
                const userColor = generateUserColor();

                return {
                    ...userData,
                    color : userColor
                };
            }
            return null;
        }
        catch(error){
            console.error("Error parsing user data :",error);
            return null;
        }

    },

    isAuthenticated : ()=>{
        try{
            const user = localStorage.getItem('user') || localStorage.getItem('currentUser');
            return !!user;
        }
        catch(error){
            console.error("Could not authenticate :", error);
        }
    },

    fetchPrivateMessages : async(user1, user2)=>{
        try{
            const response  = await api.get(`/api/messages/private?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`);
            return response.data;

        }
        catch(error){
            console.error("Error in fetching private messages : ",error);
            throw error;
        }
    },

    getOnlineUsers : async()=>{
        try{
            const response = await api.get("/auth/onlineUser");
            return response.data;
        }
        catch(error){
            console.error("Could not get online users : ",error);
            throw error;
        }
    }


}

api.interceptors.response.use(
    (response)=>response,
    (error)=>{
        if(error.response){
            switch(error.response.status){
                case 401:
                    AuthService.logout();
                    window.location.href = "/login";
                    break;
                case 403:
                    console.error('Access forbidden');
                    break;
                case 404:
                    console.error("Resourse not found");
                    break;
                case 500:
                    console.error("Server error");
                    break;


            }
        }
        else if(error.request){
            console.error("Request made but no response");
        }
        else{
            console.error("Something happened in the request");
        }
        return Promise.reject(error);
    }

);

export default AuthService;