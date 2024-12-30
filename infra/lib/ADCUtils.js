class ADCUtils {
  static capitalize(str) {
    if (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    } else {
      return 'Prod';
    }
  }
}

module.exports = { ADCUtils };
