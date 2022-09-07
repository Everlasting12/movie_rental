function myApp(message, user_defined_function) {
  let outerFunctionVariable = 23;
  let Message = message;
  let newFunc = user_defined_function;
  //   let anotherCallBackInsideOuterFunction = () => {
  //     console.log("e");
  //   };
  console.log(newFunc(outerFunctionVariable));
}

myApp("Sidhesh", (outerFunctionVariable) => {
  console.log(outerFunctionVariable);
  return "Message";
});
