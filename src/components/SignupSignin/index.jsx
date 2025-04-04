import React, { useState } from "react";
import "./styles.css";
import Input from "../Input";
import Button from "../Button";
import { toast } from "react-toastify";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider 
} from "firebase/auth";
import { auth, db, provider } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const SignupSigninComponent = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loginForm, setLoginForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function signupWithEmail(event) {
        event.preventDefault(); // Prevent form submission
        setLoading(true);
        console.log("Name", name);
        console.log("Email", email);
        console.log("Password", password);
        console.log("confirmPassword", confirmPassword);

        if (name !== "" && email !== "" && password !== "" && confirmPassword !== "") {
            if (password !== confirmPassword) {
                toast.error("Password and Confirm Password do not match");
                setLoading(false);
            } else {
                createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        // Signed up 
                        const user = userCredential.user;
                        console.log("User Created", user);
                        toast.success("User Created");
                        setLoading(false);
                        setConfirmPassword("");
                        setPassword("");
                        setEmail("");
                        setName("");
                        createDoc(user);
                        navigate("/dashboard");
                        // ...
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        toast.error(errorMessage);
                        setLoading(false);
                        // ...
                    });
            }
        } else {
            toast.error("Please fill all the fields");
            setLoading(false);
        }
    }

    async function loginUsingEmail(event) {
        event.preventDefault(); // Prevent form submission
        console.log("Email", email);
        console.log("Password", password);
        setLoading(true);
        if (email !== "" && password !== "") {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                toast.success("User Logged In");
                console.log("User Logged In", user);
                await createDoc(user); 
                setLoading(false);
                navigate("/dashboard");
            } catch (error) {
                const errorMessage = error.message;
                setLoading(false);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        } else {
            toast.error("Please fill all the fields");
            setLoading(false);
        }
    }

    async function createDoc(user) {
        setLoading(true);
        if (!user) return;

        const userRef = doc(db, "users", user.uid);
        const userData = await getDoc(userRef); // Ensure getDoc is used correctly

        if (!userData.exists()) {
            try {
                await setDoc(userRef, {
                    name: user.displayName ? user.displayName : name,
                    email: user.email,
                    photoURL: user.photoURL ? user.photoURL : "",
                    createdAt: new Date(),
                });
                toast.success("Doc Created!");
                setLoading(false);
            } catch (e) {
                toast.error(e.message);
                setLoading(false);
            }
        } else {
            toast.error("Doc Already Exists");
            setLoading(false);
        }
    }

    function googleAuth(event){
        // If this is triggered by a button click, prevent default behavior
        if (event) event.preventDefault();
        
        setLoading(true);
        console.log("Google Auth function called");
        
        try{
            console.log("Attempting to open Google sign-in popup");
            // Use async/await for better error handling
            signInWithPopup(auth, provider)
                .then((result) => {
                    console.log("Popup opened successfully");
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    const token = credential.accessToken;
                    const user = result.user;
                    console.log("User authenticated:", user);
                    toast.success("User Logged In Using Google");
                    createDoc(user);
                    setLoading(false);
                    navigate("/dashboard");
                }).catch((error) => {
                    console.error("Error in Google sign-in:", error);
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    
                    // Special handling for popup blocked errors
                    if (error.code === 'auth/popup-blocked') {
                        toast.error("Popup was blocked by your browser. Please allow popups for this site.");
                    } else {
                        toast.error(errorMessage);
                    }
                    setLoading(false);
                });
        } catch(e){
            console.error("Exception in googleAuth function:", e);
            toast.error(e.message);
            setLoading(false);
        } finally {
            // Ensure loading state is reset if the popup doesn't open
            setTimeout(() => {
                if (loading) setLoading(false);
            }, 1000);
        }
    }

    return (
        <>
            {loginForm ? (
                <div className="signup-wrapper">
                    <h2 className="title">
                        Login On <span style={{ color: "var(--theme)" }}>FinFolio</span>
                    </h2>
                    <form>

                        <Input
                            type={"email"}
                            label={"Email"}
                            state={email}
                            setState={setEmail}
                            placeholder={"JohnDoe@gmail.com"}
                        />
                        <Input
                            type={"password"}
                            label={"Password"}
                            state={password}
                            setState={setPassword}
                            placeholder={"Example@123"}

                        />

                        <Button
                            disabled={loading}
                            text={loading ? "Loading..." : "Login Using Email and Password"} onclick={(event) => loginUsingEmail(event)} />
                        <p className="p-login">or</p>
                        <Button 
                        onclick={googleAuth}
                        text={loading ? "Loading..." : "Login Using Google"} blue={true} />
                        <p className="p-login" style={{ cursor: "pointer" }} onClick={() => setLoginForm(!loginForm)}>or Don`t Have An Account? Click Here</p>
                    </form>
                </div>) : (<div className="signup-wrapper">
                    <h2 className="title">
                        Sign Up On <span style={{ color: "var(--theme)" }}>FinFolio</span>
                    </h2>
                    <form>
                        <Input
                            label={"Full Name"}
                            state={name}
                            setState={setName}
                            placeholder={"John Doe"}
                        />
                        <Input
                            type={"email"}
                            label={"Email"}
                            state={email}
                            setState={setEmail}
                            placeholder={"JohnDoe@gmail.com"}
                        />
                        <Input
                            type={"password"}
                            label={"Password"}
                            state={password}
                            setState={setPassword}
                            placeholder={"Example@123"}

                        />
                        <Input
                            type={"password"}
                            label={"Confirm Password"}
                            state={confirmPassword}
                            setState={setConfirmPassword}
                            placeholder={"Example@123"}
                        />
                        <Button
                            disabled={loading}
                            text={loading ? "Loading..." : "Signup Using Email and Password"} onclick={(event) => signupWithEmail(event)} />
                        <p className="p-login">or</p>
                        <Button
                        onclick={googleAuth}
                         text={loading ? "Loading..." : "Signup Using Google"} blue={true} />
                        <p className="p-login" style={{ cursor: "pointer" }} onClick={() => setLoginForm(!loginForm)}>or Have An Account Already? Click Here</p>
                    </form>
                </div>)}

        </>
    );
};

export default SignupSigninComponent;
