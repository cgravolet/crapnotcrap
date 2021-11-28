import 'package:flutter/material.dart';
import 'package:crapnotcrap/model/topic.dart';

class TopicDetail extends StatelessWidget {
  const TopicDetail({Key? key, required this.topic}) : super(key: key);

  final Topic topic;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(topic.title)),
      body: SafeArea(
        child: Column(
          children: [
            Text(
              topic.title,
              style: Theme.of(context).textTheme.headline1,
            ),
          ],
        ),
      ),
    );
  }
}
