using sys

class Example
{
  static Void main()
  {
    // control flow
    x := 10
    if (x > 5)
    {
      echo("big")
    }
    else
    {
      echo("small")
    }

    for (Int i := 0; i < 10; ++i) echo(i)

    while (x > 0) x--

    switch (x)
    {
      case 0: echo("zero")
      case 1: echo("one")
      default: echo("other")
    }

    try
    {
      risky()
    }
    catch (Err e)
    {
      echo(e)
    }
    finally
    {
      cleanup()
    }

    // operators
    y := a ?: b
    z := cond ? a : b
    r := 0..10
    obj?.method()
    list[0]
    x += 1
    x is Str
    x as Str?
  }
}
