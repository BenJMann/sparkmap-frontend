const url = process.env.REACT_APP_API

const encode = (data) => {
  var formBody = [];
  for (var property in data) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(data[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  return formBody.join("&");
}


export async function ApiLogin(details) {
  const formBody = encode(details)
  const response = await fetch(url + "login", {
    method: "POST",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: formBody
  })

//   if (response.status >= 400)
//   throw (new Error('Network request failed'))

  return await response.json()

}

export async function ApiGetHi() {
    const token = sessionStorage.getItem('token')
    const response = await fetch(url+"hi", {
      method: 'GET',
      headers: {
        authorization: token
      }
    })
    if (response.status >= 400)
      throw (new Error('Network request failed'))
  
    return await response.json();
  }
