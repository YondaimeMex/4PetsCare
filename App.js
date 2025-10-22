import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image} from 'react-native';

export default function App() {
  return (
    <>  
    <Image
        source={{
          uri: "https://cdn.rafled.com/anime-icons/images/2015efbc2da8c6bb3e6f709ec9a1354cfa68a8c2f4a9f12dbd78c5eee49eb94c.jpg",
        }}
        style={styles.image}
      />

      <Image
        source={{
          uri: "https://i1.sndcdn.com/artworks-000147503915-rk15y4-t500x500.jpg",
        }}
        style={styles.yondaime}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius:10,
    margin: 90,
  },
  yondaime: {
    width: 200,
    height: 200,
    borderRadius:10,
    margin: 90,
  }
});
