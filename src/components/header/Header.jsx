import "./Header.css";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { useContext } from "react";
import avatar from "../../assets/avatar.png";
import { UserContext } from "../../context/UserContext";

const Header = () => {
  const [user, setUser] = useContext(UserContext);

  const signInWithGoogle = async () => {
    const googleProvider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      console.error("Error during sign in with Google: ", error);
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="header-container">
      <div className="user-profile">
        <img src={user ? user?.photoURL : avatar} alt="user-profile-pic" />
        <p>{user ? user?.displayName : "Guest User"}</p>
      </div>
      {user ? (
        <button onClick={signOut} className="LogOut">
          Logout
        </button>
      ) : (
        <button className="signIn" onClick={signInWithGoogle}>
          <FcGoogle size={40} />
          <span>SignIn with google</span>
        </button>
      )}
    </div>
  );
};

export default Header;
