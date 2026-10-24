// Chapter-to-page mapping for the supplied English manuscript.
const chapters = [
  ['Ash', 2], ['The Man', 5], ['Steel and Silence', 8], ['The Word', 14], ['Protection', 18], ['The Pause', 22], ['The Mountain', 26], ['The Road', 30], ['Misread', 34],
  ['Heart', 38], ['Blade', 45], ['Brother', 51], ['Artist', 57], ['Belonging', 63], ['Alive', 67], ['The Fox', 71], ['Victory', 73], ['The Deal', 80], ['The Boys', 83],
  ['Crossing', 88], ['The Web', 93], ['Watching Eyes', 96], ['Structure', 100], ['Training Grounds', 102], ['Focus', 106], ['Rain', 109], ['Still Water', 113], ['The Unseen', 117], ['The Door', 122], ['Quiet', 126], ['Waiting', 129], ['Torn', 131], ['The Message', 135], ['The Truth', 138], ['Black Crows', 141], ['The Sentinel', 144], ['Hesitation', 148], ['Blame', 151], ['Blood Moon', 154], ['Patience', 157],
  ['Taken', 160], ['Body', 163], ['The Cold', 167], ['Cracks', 170], ['The Offer', 174], ['The Approach', 179], ['The Assault', 183], ['Smoke', 188], ['Burn', 191], ['Home', 194], ['Challenge', 200], ['Mind', 205], ['The Overlap', 210], ['The Spear', 215], ['Misalignment', 222], ['Breaking Point', 228], ['Shogi', 232], ['Irreversible', 237], ['Collapse', 242],
  ['Distance', 246], ['Patterns', 250], ['Separation', 257], ['Manslayer', 261], ['Identity', 267], ['Echo', 273], ['The Observer', 278], ['Mirror', 284], ['Formation', 290], ['Choice', 295], ['Mist', 299], ['Unleashed', 303], ['The Killer', 309], ['Monster', 314], ['Pressure', 319],
  ['Incomplete', 324], ['Movement', 330], ['The Fire', 335], ['Closer', 340], ['The Boy', 344], ['The Inevitability', 350], ['The Raven', 354], ['Revenge', 360], ['Stones', 365], ['Disruption', 372], ['Arrows', 377], ['The Demon', 381], ['The Eyes', 386], ['Winning', 390], ['Salvation', 394], ['Remains', 398], ['Again.', 400],
];
const acts = [[1, 9, 'ASHES'], [10, 19, 'CROWS'], [20, 40, 'RAIN'], [41, 59, 'SMOKE'], [60, 74, 'MIST'], [75, 91, 'FIRE']];
export const bookIndex = chapters.map(([title, page], index) => {
  const chapterNumber = index + 1;
  const act = acts.findIndex(([, to]) => chapterNumber <= to);
  const [, , actTitle] = acts[act];
  return { act: act + 1, actTitle, chapterNumber, title, page };
});
