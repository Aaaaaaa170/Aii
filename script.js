const messages = [];

const saved =
  localStorage.getItem("chatHistory");

if(saved){

  const history =
    JSON.parse(saved);

  messages.push(...history);

}

function formatMessage(text){

  return marked.parse(text);

}

function clearChat(){

  if(
    !confirm(
      "履歴を削除しますか？"
    )
  ){
    return;
  }

  document
    .getElementById("chat")
    .innerHTML = "";

  messages.length = 0;

  localStorage.removeItem(
    "chatHistory"
  );

}

function newChat(){

  document
    .getElementById("chat")
    .innerHTML = "";

  messages.length = 0;

  localStorage.removeItem(
    "chatHistory"
  );

}

function toggleSidebar(){

  const sidebar =
    document.getElementById(
      "sidebar"
    );

  const main =
    document.getElementById(
      "main"
    );

  sidebar.classList.toggle(
    "collapsed"
  );

  main.classList.toggle(
    "expanded"
  );

}

window.onload = function(){

  const chat =
    document.getElementById(
      "chat"
    );

  if(!saved) return;

  const history =
    JSON.parse(saved);

  history.forEach(

    function(msg){

      chat.innerHTML += `
        <div class="message ${
          msg.role === "user"
          ? "user"
          : "ai"
        }">
          ${formatMessage(
            msg.content
          )}
        </div>
      `;

    }

  );

};

async function sendMessage(){

  const input =
    document.getElementById(
      "message"
    );

  const text =
    input.value.trim();

  if(!text) return;

  const chat =
    document.getElementById(
      "chat"
    );

  chat.innerHTML += `
    <div class="message user">
      ${text}
    </div>
  `;

  messages.push({
    role:"user",
    content:text
  });

  localStorage.setItem(
    "chatHistory",
    JSON.stringify(messages)
  );

  input.value = "";

  chat.innerHTML += `
    <div
      class="message ai"
      id="loading"
    >
      🤔 考え中...
    </div>
  `;

  chat.scrollTop =
    chat.scrollHeight;

  try{

    const response =
      await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json",

            "Authorization":
              "Bearer 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"
          },

          body:JSON.stringify({

            model:
              "nvidia/nemotron-3-super-120b-a12b:free",

            messages:messages

          })

        }
      );

    const data =
      await response.json();

    document
      .getElementById(
        "loading"
      )
      ?.remove();

    if(!response.ok){

      chat.innerHTML += `
        <div class="message ai">
          エラー:
          ${JSON.stringify(data)}
        </div>
      `;

      return;

    }

    const reply =
      data.choices[0]
      .message.content;

    messages.push({
      role:"assistant",
      content:reply
    });

    localStorage.setItem(
      "chatHistory",
      JSON.stringify(messages)
    );

    const aiDiv =
      document.createElement(
        "div"
      );

    aiDiv.className =
      "message ai";

    chat.appendChild(
      aiDiv
    );

    let currentText = "";

    for(
      let i = 0;
      i < reply.length;
      i++
    ){

      currentText +=
        reply[i];

      aiDiv.innerHTML =
        formatMessage(
          currentText
        );

      chat.scrollTop =
        chat.scrollHeight;

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            15
          )
      );

    }

  }
  catch(error){

    document
      .getElementById(
        "loading"
      )
      ?.remove();

    chat.innerHTML += `
      <div class="message ai">
        エラー:
        ${error.message}
      </div>
    `;

  }

}

document
  .getElementById(
    "message"
  )
  .addEventListener(
    "keydown",
    function(e){

      if(
        e.key === "Enter"
      ){

        sendMessage();

      }

    }
  );
