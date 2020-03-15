import React, { useState, useCallback, useEffect } from 'react';

import { ServiceChat } from './services/chatService';
import './index.css';

const dataAtualFormatada = () => {
  const data = new Date();
  return data.toLocaleTimeString();
};

function App() {
  const [value, setValue] = useState('');
  const [messages, setMessage] = useState([
    {
      id: 1,
      isBoot: true,
      text:
        'Seja bem vindo! Por favor reformule a pergunta a seguir, para eu dizer a resposta. Se quiser uma outra pergunta digite /pergunta, e depois me avalie.',
      hour: `${dataAtualFormatada()}, Hoje`,
    },
  ]);

  function perguntaSugerida() {
    ServiceChat.getPerguntaSugerida().then(({ data }) => {
      const { pergunta, resposta } = data;
      setMessage([
        ...messages,
        {
          id: messages.length + 1,
          isBoot: true,
          text: `Pergunta Sugerida: ${pergunta}`,
          hour: `${dataAtualFormatada()}, Hoje`,
        },
        {
          id: messages.length + 2,
          isBoot: true,
          text: `Resposta na base de dados: ${resposta}`,
          hour: `${dataAtualFormatada()}, Hoje`,
        },
      ]);
    });
  }

  function respondePergunta(pergunta) {
    ServiceChat.fazerPergunta(pergunta).then(({ data }) => {
      const { resposta } = data;
      setMessage([
        ...messages,
        {
          id: messages.length + 1,
          isBoot: false,
          text: pergunta,
          hour: `${dataAtualFormatada()}, Hoje`,
        },
        {
          id: messages.length + 1,
          isBoot: true,
          text: resposta,
          hour: `${dataAtualFormatada()}, Hoje`,
        },
      ]);
    });
  }
  const initFectch = useCallback(() => {
    perguntaSugerida();
  }, []);

  useEffect(() => {
    initFectch();
  }, [initFectch]);

  async function novaPerguntaSugerida() {
    await perguntaSugerida();
  }

  function responderUsuario(valueInformed) {
    if (valueInformed === '/pergunta') {
      novaPerguntaSugerida(valueInformed);
    } else {
      respondePergunta(valueInformed);
    }
    setValue('');
  }

  const countMessage = messages.length;
  return (
    <div className="container-fluid h-100">
      <br /> <br />
      <div className="row justify-content-center h-100">
        <div className="col-md-4 col-xl-3 chat">
          <div className="card mb-sm-3 mb-md-0 contacts_card">
            <div className="card-header">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Busca..."
                  name=""
                  className="form-control search"
                />
                <div className="input-group-prepend">
                  <span className="input-group-text search_btn">
                    <i className="fas fa-search" />
                  </span>
                </div>
              </div>
            </div>
            <div className="card-body contacts_body">
              <ui className="contacts">
                <li className="active">
                  <div className="d-flex bd-highlight">
                    <div className="img_cont">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Unofficial_JavaScript_logo_2.svg/1200px-Unofficial_JavaScript_logo_2.svg.png"
                        className="rounded-circle user_img"
                        alt="javascript-boot"
                      />
                      <span className="online_icon" />
                    </div>
                    <div className="user_info">
                      <span>JavaScript Boot</span>
                      <p>online</p>
                    </div>
                  </div>
                </li>
              </ui>
            </div>
            <div className="card-footer" />
          </div>
        </div>
        <div className="col-md-8 col-xl-6 chat">
          <div className="card">
            <div className="card-header msg_head">
              <div className="d-flex bd-highlight">
                <div className="img_cont">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Unofficial_JavaScript_logo_2.svg/1200px-Unofficial_JavaScript_logo_2.svg.png"
                    className="rounded-circle user_img"
                    alt="teste"
                  />
                  <span className="online_icon" />
                </div>
                <div className="user_info">
                  <span>Chat - JavaScriptBot </span>
                  <p>{countMessage} Messages</p>
                </div>
              </div>
              <span id="action_menu_btn">
                <i className="fas fa-ellipsis-v" />
              </span>
            </div>
            <div className="card-body msg_card_body">
              {messages.map(message => {
                const { isBoot, text, hour, id } = message;
                if (isBoot) {
                  return (
                    <div key={id}>
                      <div className="d-flex justify-content-start mb-4">
                        <div className="img_cont_msg">
                          <img
                            src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg"
                            className="rounded-circle user_img_msg"
                            alt="javascript_logo"
                          />
                        </div>
                        <div className="msg_cotainer">
                          {text}
                          <span className="msg_time">{hour}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="d-flex justify-content-end mb-4">
                    <div className="msg_cotainer_send">
                      {text}
                      <span className="msg_time_send">{hour}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="card-footer">
              <div className="input-group">
                <textarea
                  name=""
                  className="form-control type_msg"
                  placeholder="Faça a pergunta"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                />
                <div
                  className="input-group-append"
                  onClick={() => responderUsuario(value)}
                >
                  <span className="input-group-text send_btn">
                    <i className="fas fa-location-arrow" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
