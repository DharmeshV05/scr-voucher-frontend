export const convertNumberToWords = (num) => {
    const ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
    ];
    const teens = [
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];
    const scales = ["", "thousand", "million", "billion", "trillion"];
  
    if (num === 0) return "zero";
    if (num < 0) return "negative numbers are not supported";
  
    const chunks = [];
    while (num > 0) {
      chunks.push(num % 1000);
      num = Math.floor(num / 1000);
    }
  
    const convertChunk = (n) => {
      if (n === 0) return "";
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100)
        return (
          tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
        );
      return (
        ones[Math.floor(n / 100)] +
        " hundred" +
        (n % 100 !== 0 ? " " + convertChunk(n % 100) : "")
      );
    };
  
    const words = chunks.map((chunk, index) => {
      if (chunk === 0) return "";
      const chunkWords = convertChunk(chunk);
      return chunkWords + (index > 0 ? " " + scales[index] : "");
    });
  
    return words.reverse().join(" ").trim();
  };
  