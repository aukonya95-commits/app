const handleLogin = async () => {
    setLoading(true);
    try {
      // Senin AuthContext dosmandaki orijinal login fonksiyonunu çağırıyoruz
      const result = await login(username, password); 
      
      // ÖNEMLİ: Senin sistemin 'success' adında bir değer döndürüyor
      if (result && result.success === true) {
        router.replace('/(tabs)');
      } else {
        // Eğer success false ise servisinden gelen mesajı gösterir
        Alert.alert('Giriş Başarısız', result.message || 'Hatalı bilgiler.');
      }
    } catch (error) {
      // Eğer internet yoksa veya sunucu kapalıysa buraya düşer
      Alert.alert('Hata', 'Sunucuya ulaşılamadı.');
    } finally {
      setLoading(false);
    }
  };