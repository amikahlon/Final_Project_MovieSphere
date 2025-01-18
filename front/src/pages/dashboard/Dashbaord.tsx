import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const Dashbaord = () => {

  const user = useSelector((state: RootState) => state.user.user);
const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

console.log(JSON.stringify(user));

console.log(isAuthenticated);

  return (
    <div>
      xxxyyy
    </div>
  );
};

export default Dashbaord;
