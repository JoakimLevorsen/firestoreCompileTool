# ParserFlow

1. Parser is created.
2. Parser recives .addToken, returns data if the last token has made a meaningfull change.
3. Parser is tested for .canAccept, if true go to 2.
4. The last returned result is used
