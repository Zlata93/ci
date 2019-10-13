# ci
ci workflow emulation

## Как запустить
* в каждой из директорий (server, agent) сделать ```npm i```, ```npm start```
* Замечание: на windows команда npm start для агента отрабатывает некорректно, запуская только первый агент - получается запустить, если вместо ```npm start``` напрямую вводить команду, прописанную там: ```node agent_1 & node agent_2 & node agent_3``` (в терминале git bash)
* Доступные ветки в тестовом репозитории: develop, front, master, readme
* Запуск сборки в тестовом репозитории: ```npm i && npm run build```

## Ситуации из требований к заданию и обоснование принятых решений
* Ситуация, когда агент прекратил работать между сборками: мы узнаем об этом, когда попытаемся к нему отправить запрос на сборку - в ответ получим ошибку, отправим ее в ответ на клиент (со статусом Failure), самого агента отфильтруем из списка зарегестрированных агентов. Когда агент восстановится, он заново зарегистрируется на сервере через ручку ```/notify_agent```
* Ситуация, когда агент прекратил работать в процессе выполнения сборки: обработка такая же, как у предыдущего случая (отправляем ошибку, выкидываем агента из зарегестрированных, агент регистрируется заново в случае восстановления). В идеале можно было бы адресовать эту невыполненную команду сборки другому свободному агенту (только что пришло в голову, соответственно не реализовано)
* Ситуация, когда агенты не справляются с поступающими заявками: если все агенты заняты, отправляем на клиент сообщение об этом, команду на сорку нигде не сохраняем. В иделае конечно нужно создать очередь на команды сборки и при освобождении очередного агента брать команду оттуда. Но тогда наверное все равно нужно ограничить длину этой очереди
* Ситуация, когда при старте агент не смог соединиться с сервером: агент пытается соединиться с сервером каждые 5 секунд, пока одна из попыток не завершится успехом (стоит ли ограничивать количество попыток?)
* Ситуация, когда при отправке результатов сборки агент не смог соединиться с сервером: помечаем, что соединение утеряно и, как в предыдущем пункте, пытаемся установить связь каждые 5 секунд, пока не преуспеем. В иделе хорошо бы хранить у агента резельтаты сборки и отдавать их серверу при восстановлении соединения, но так как в моей реализации результаты сборки сохраняются со всеми нужными полями после ответа агента на ```/build``` запрос, такое поведение не предусмотрено. (Потребовался бы рефакторинг и пришлось бы отправлять дополнительные данные в ручку ```/notify_build_result``` - команду и хэш коммита). Может, можно как-то по-другому? 
