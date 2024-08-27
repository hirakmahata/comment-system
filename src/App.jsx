import { Suspense, lazy, useContext, useEffect, useState } from "react";
import "./App.css";
import { UserContext } from "./context/UserContext";
import { auth, onAuthStateChanged } from "./firebase";
const Skeleton = lazy(() => import("./components/skeleton/Skeleton"));
const Header = lazy(() => import("./components/header/Header"));
const Filter = lazy(() => import("./components/filter/Filter"));
const Comments = lazy(() => import("./components/comments/Comments"));

function App() {
  console.log('API Key:', import.meta.env.VITE_MY_NAME);
  const [user, setUser] = useContext(UserContext);
  const [totalComments, setTotalComments] = useState(0);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="main-container">
      <Suspense fallback={<Skeleton width="90vw" length={10} />}>
        <Header />
      </Suspense>

      <div className="filter-comments-container">
        <Suspense fallback={<Skeleton width="90vw" length={10} />}>
          <Filter totalComments={totalComments} />
        </Suspense>
        <Suspense fallback={<Skeleton width="90vw" length={10} />}>
          <Comments setTotalComments={setTotalComments} />
        </Suspense>
      </div>
    </div>
  );
}

export default App;
